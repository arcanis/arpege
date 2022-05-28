import * as arrays      from '../../utils/arrays';
import {VERSION}        from '../..';
import * as asts        from '../asts';
import * as js          from '../js';
import * as op          from '../opcodes';
import {CompileOptions} from '..';

import {Bytecode}       from './generate-bytecode';

const saferEval = eval;

/* Generates parser JavaScript code. */
export function generateJS(ast: asts.Ast, options: CompileOptions) {
  /* These only indent non-empty lines to avoid trailing whitespace. */
  function indent2(code: string)  {
    return code.replace(/^(.+)$/gm, `  $1`);
  }
  function indent6(code: string)  {
    return code.replace(/^(.+)$/gm, `      $1`);
  }

  function generateTables() {
    return ast.consts!.map(
      (c, i) => {
        return `peg$c${i} = ${c},`;
      },
    ).join(`\n`);
  }

  function generateRuleHeader(ruleNameCode: string, ruleIndexCode: string) {
    const parts = [];

    parts.push(``);

    if (options.trace) {
      parts.push([
        `peg$tracer.trace({`,
        `  type:     "rule.enter",`,
        `  rule:     ${ruleNameCode},`,
        `  location: peg$computeLocation(startPos, startPos)`,
        `});`,
        ``,
      ].join(`\n`));
    }

    if (options.cache) {
      parts.push([
        `var key    = peg$currPos * ${ast.rules.length} + ${ruleIndexCode},`,
        `    cached = peg$resultsCache[key];`,
        ``,
        `if (cached) {`,
        `  peg$currPos = cached.nextPos;`,
        ``,
      ].join(`\n`));

      if (options.trace) {
        parts.push([
          `if (cached.result !== peg$FAILED) {`,
          `  peg$tracer.trace({`,
          `    type:   "rule.match",`,
          `    rule:   ${ruleNameCode},`,
          `    result: cached.result,`,
          `    location: peg$computeLocation(startPos, peg$currPos)`,
          `  });`,
          `} else {`,
          `  peg$tracer.trace({`,
          `    type: "rule.fail",`,
          `    rule: ${ruleNameCode},`,
          `    location: peg$computeLocation(startPos, startPos)`,
          `  });`,
          `}`,
          ``,
        ].join(`\n`));
      }

      parts.push([
        `  return cached.result;`,
        `}`,
        ``,
      ].join(`\n`));
    }

    return parts.join(`\n`);
  }

  function generateRuleFooter(ruleNameCode: string, resultCode: string) {
    const parts = [];

    if (options.cache) {
      parts.push([
        ``,
        `peg$resultsCache[key] = { nextPos: peg$currPos, result: ${resultCode} };`,
      ].join(`\n`));
    }

    if (options.trace) {
      parts.push([
        ``,
        `if (${resultCode} !== peg$FAILED) {`,
        `  peg$tracer.trace({`,
        `    type:   "rule.match",`,
        `    rule:   ${ruleNameCode},`,
        `    result: ${resultCode},`,
        `    location: peg$computeLocation(startPos, peg$currPos)`,
        `  });`,
        `} else {`,
        `  peg$tracer.trace({`,
        `    type: "rule.fail",`,
        `    rule: ${ruleNameCode},`,
        `    location: peg$computeLocation(startPos, startPos)`,
        `  });`,
        `}`,
      ].join(`\n`));
    }

    parts.push([
      ``,
      `return ${resultCode};`,
    ].join(`\n`));

    return parts.join(`\n`);
  }

  function generateRuleFunction(rule: asts.Rule) {
    const parts: Array<string> = [];

    function c(i: number) {
      return `peg$c${i}`;
    } // |consts[i]| of the abstract machine

    function s(i: number) {
      return `s${i}`;
    } // |stack[i]| of the abstract machine

    const stack = {
      sp: -1,
      maxSp: -1,

      push(exprCode: string) {
        const code = `${s(++this.sp)} = ${exprCode};`;

        if (this.sp > this.maxSp)
          this.maxSp = this.sp;

        return code;
      },

      pop() {
        return s(this.sp--);
      },

      popN(n: number) {
        const values = arrays
          .range(this.sp - n + 1, this.sp + 1)
          .map(s);

        this.sp -= n;

        return values;
      },

      top() {
        return s(this.sp);
      },

      topN(n: number) {
        const values = arrays
          .range(this.sp - n + 1, this.sp + 1)
          .map(s);

        return values;
      },

      index(i: number) {
        return s(this.sp - i);
      },
    };

    function compile(bc: Bytecode) {
      const end = bc.length;
      const parts: Array<string> = [];

      let ip = 0;
      let value: string;

      function compileCondition(cond: string, argCount: number) {
        const baseLength = argCount + 3;
        const thenLength = bc[ip + baseLength - 2];
        const elseLength = bc[ip + baseLength - 1];

        const baseSp = stack.sp;

        ip += baseLength;
        const thenCode = compile(bc.slice(ip, ip + thenLength));
        const thenSp = stack.sp;
        ip += thenLength;

        let elseSp: number;
        let elseCode = ``;

        if (elseLength > 0) {
          stack.sp = baseSp;
          elseCode = compile(bc.slice(ip, ip + elseLength));
          elseSp = stack.sp;
          ip += elseLength;

          if (thenSp !== elseSp) {
            throw new Error(
              `Branches of a condition must move the stack pointer in the same way.`,
            );
          }
        }

        parts.push(`if (${cond}) {`);
        parts.push(indent2(thenCode));
        if (elseLength > 0) {
          parts.push(`} else {`);
          parts.push(indent2(elseCode));
        }
        parts.push(`}`);
      }

      function compileLoop(cond: string) {
        const baseLength = 2;
        const bodyLength = bc[ip + baseLength - 1];

        const baseSp = stack.sp;

        ip += baseLength;
        const bodyCode = compile(bc.slice(ip, ip + bodyLength));
        const bodySp = stack.sp;
        ip += bodyLength;

        if (bodySp !== baseSp)
          throw new Error(`Body of a loop can't move the stack pointer.`);

        parts.push(`while (${cond}) {`);
        parts.push(indent2(bodyCode));
        parts.push(`}`);
      }

      function compileCall() {
        const baseLength = 4;
        const paramsLength = bc[ip + baseLength - 1];

        const value = `${c(bc[ip + 1])}(${
          bc.slice(ip + baseLength, ip + baseLength + paramsLength).map(
            p => {
              return stack.index(p);
            },
          ).join(`, `)
        })`;

        stack.popN(bc[ip + 2]);
        parts.push(stack.push(value));

        ip += baseLength + paramsLength;
      }

      while (ip < end) {
        switch (bc[ip]) {
          case op.PUSH: {             // PUSH c
            parts.push(stack.push(c(bc[ip + 1])));
            ip += 2;
          } break;

          case op.PUSH_CURR_POS: {    // PUSH_CURR_POS
            parts.push(stack.push(`peg$currPos`));
            ip++;
          } break;

          case op.PUSH_UNDEFINED: {    // PUSH_UNDEFINED
            parts.push(stack.push(`void 0`));
            ip++;
          } break;

          case op.PUSH_NULL: {        // PUSH_NULL
            parts.push(stack.push(`null`));
            ip++;
          } break;

          case op.PUSH_FAILED: {      // PUSH_FAILED
            parts.push(stack.push(`peg$FAILED`));
            ip++;
          } break;

          case op.PUSH_EMPTY_ARRAY: { // PUSH_EMPTY_ARRAY
            parts.push(stack.push(`[]`));
            ip++;
          } break;

          case op.POP: {              // POP
            stack.pop();
            ip++;
          } break;

          case op.POP_CURR_POS: {     // POP_CURR_POS
            parts.push(`peg$currPos = ${stack.pop()};`);
            ip++;
          } break;

          case op.POP_N: {            // POP_N n
            stack.popN(bc[ip + 1]);
            ip += 2;
          } break;

          case op.NIP: {              // NIP
            value = stack.pop();
            stack.pop();
            parts.push(stack.push(value));
            ip++;
          } break;

          case op.APPEND: {           // APPEND
            value = stack.pop();
            parts.push(`${stack.top()}.push(${value});`);
            ip++;
          } break;

          case op.WRAP: {             // WRAP n
            parts.push(
              stack.push(`[${stack.popN(bc[ip + 1]).join(`, `)}]`),
            );
            ip += 2;
          } break;

          case op.TEXT: {             // TEXT
            parts.push(
              stack.push(`input.substring(${stack.pop()}, peg$currPos)`),
            );
            ip++;
          } break;

          case op.IF: {               // IF t, f
            compileCondition(stack.top(), 0);
          } break;

          case op.IF_ERROR: {         // IF_ERROR t, f
            compileCondition(`${stack.top()} === peg$FAILED`, 0);
          } break;

          case op.IF_NOT_ERROR: {     // IF_NOT_ERROR t, f
            compileCondition(`${stack.top()} !== peg$FAILED`, 0);
          } break;

          case op.WHILE_NOT_ERROR: {  // WHILE_NOT_ERROR b
            compileLoop(`${stack.top()} !== peg$FAILED`);
          } break;

          case op.MATCH_ANY: {        // MATCH_ANY a, f, ...
            compileCondition(`input.length > peg$currPos`, 0);
          } break;

          case op.MATCH_STRING: {     // MATCH_STRING s, a, f, ...
            const evaluatedData = saferEval(ast.consts![bc[ip + 1]]);

            const matcher = evaluatedData.length > 1
              ? `input.substr(peg$currPos, ${evaluatedData.length}) === ${c(bc[ip + 1])}`
              : `input.charCodeAt(peg$currPos) === ${evaluatedData.charCodeAt(0)}`;

            compileCondition(matcher, 1);
          } break;

          case op.MATCH_STRING_IC: {  // MATCH_STRING_IC s, a, f, ...
            const evaluatedData = saferEval(ast.consts![bc[ip + 1]]);
            const cond = `input.substr(peg$currPos, ${evaluatedData.length}).toLowerCase() === ${c(bc[ip + 1])}`;

            compileCondition(cond, 1);
          } break;

          case op.MATCH_REGEXP: {     // MATCH_REGEXP r, a, f, ...
            const cond = `${c(bc[ip + 1])}.test(input.charAt(peg$currPos))`;
            compileCondition(cond, 1);
          } break;

          case op.ACCEPT_N: {         // ACCEPT_N n
            const firstPart = bc[ip + 1] > 1
              ? `input.substr(peg$currPos, ${bc[ip + 1]})`
              : `input.charAt(peg$currPos)`;

            const secondPart = bc[ip + 1] > 1
              ? `peg$currPos += ${bc[ip + 1]};`
              : `peg$currPos++;`;

            parts.push(stack.push(firstPart));
            parts.push(secondPart);

            ip += 2;
          } break;

          case op.ACCEPT_STRING: {    // ACCEPT_STRING s
            const evaluatedData = saferEval(ast.consts![bc[ip + 1]]);

            const firstPart = c(bc[ip + 1]);
            const secondPart = evaluatedData.length > 1
              ? `peg$currPos += ${evaluatedData.length};`
              : `peg$currPos++;`;

            parts.push(stack.push(firstPart));
            parts.push(secondPart);

            ip += 2;
          } break;

          case op.FAIL: {             // FAIL e
            parts.push(stack.push(`peg$FAILED`));
            parts.push(`if (peg$silentFails === 0) { peg$fail(${c(bc[ip + 1])}); }`);

            ip += 2;
          } break;

          case op.LOAD_SAVED_POS: {   // LOAD_SAVED_POS p
            parts.push(`peg$savedPos = ${stack.index(bc[ip + 1])};`);

            ip += 2;
          } break;

          case op.UPDATE_SAVED_POS: { // UPDATE_SAVED_POS
            parts.push(`peg$savedPos = peg$currPos;`);

            ip++;
          } break;

          case op.CALL: {             // CALL f, n, pc, p1, p2, ..., pN
            compileCall();
          } break;

          case op.RULE: {             // RULE r
            parts.push(stack.push(`peg$parse${ast.rules[bc[ip + 1]].name}()`));

            ip += 2;
          } break;

          case op.SILENT_FAILS_ON: {  // SILENT_FAILS_ON
            parts.push(`peg$silentFails++;`);

            ip++;
          } break;

          case op.SILENT_FAILS_OFF: { // SILENT_FAILS_OFF
            parts.push(`peg$silentFails--;`);

            ip++;
          } break;

          case op.BEGIN_TRANSACTION: { // BEGIN_TRANSACTION
            parts.push(`peg$transactions.unshift([]);`);

            ip++;
          } break;

          case op.ROLLBACK_TRANSACTION: { // ROLLBACK_TRANSACTION
            parts.push(`peg$transactions.shift().forEach(fn => fn());`);

            ip++;
          } break;

          case op.COMMIT_TRANSACTION: { // COMMIT_TRANSACTION
            parts.push(`peg$currentTransaction = peg$transactions.shift();`);
            parts.push(`if (peg$transactions.length > 0) {`);
            parts.push(`  peg$transactions[0].unshift(...peg$currentTransaction);`);
            parts.push(`} else {`);
            parts.push(`  peg$currentTransaction = undefined;`);
            parts.push(`}`);

            ip++;
          } break;

          case op.ENTER_SCOPE: { // ENTER_SCOPE f, n, pc, p1, p2, ..., pN
            compileCall();
            parts.push(`peg$scopes.unshift(${stack.pop()});`);
          } break;

          case op.EXIT_SCOPE: { // EXIT_SCOPE
            parts.push(`peg$scopes.shift()?.()`);

            ip++;
          } break;

          default: {
            throw new Error(`Invalid opcode: ${bc[ip]}.`);
          }
        }
      }

      return parts.join(`\n`);
    }

    const code = compile(rule.bytecode!);

    parts.push(`function peg$parse${rule.name}() {`);

    if (options.trace) {
      parts.push([
        `  var ${arrays.range(0, stack.maxSp + 1).map(s).join(`, `)},`,
        `      startPos = peg$currPos;`,
      ].join(`\n`));
    } else {
      parts.push(
        `  var ${arrays.range(0, stack.maxSp + 1).map(s).join(`, `)};`,
      );
    }

    const ruleHeader = generateRuleHeader(
      `"${js.stringEscape(rule.name)}"`,
      `${asts.indexOfRule(ast, rule.name)}`,
    );

    const ruleFooter = generateRuleFooter(
      `"${js.stringEscape(rule.name)}"`,
      s(0),
    );

    parts.push(indent2(ruleHeader));
    parts.push(indent2(code));
    parts.push(indent2(ruleFooter));

    parts.push(`}`);

    return parts.join(`\n`);
  }

  function generateToplevel() {
    const parts: Array<string> = [];

    parts.push([
      `function peg$subclass(child, parent) {`,
      `  function ctor() { this.constructor = child; }`,
      `  ctor.prototype = parent.prototype;`,
      `  child.prototype = new ctor();`,
      `}`,
      ``,
      `function peg$SyntaxError(message, expected, found, location) {`,
      `  if (location)`,
      `    message = message.replace(/\\.$/, ' at line ' + location.start.line + ', column ' + location.start.column + '.');`,
      ``,
      `  this.message  = message;`,
      `  this.expected = expected;`,
      `  this.found    = found;`,
      `  this.location = location;`,
      `  this.name     = "PegSyntaxError";`,
      ``,
      `  if (typeof Error.captureStackTrace === "function") {`,
      `    Error.captureStackTrace(this, peg$SyntaxError);`,
      `  }`,
      `}`,
      ``,
      `peg$subclass(peg$SyntaxError, Error);`,
      ``,
      `peg$SyntaxError.buildMessage = function(expected, found) {`,
      `  var DESCRIBE_EXPECTATION_FNS = {`,
      `        literal: function(expectation) {`,
      `          return "\\"" + literalEscape(expectation.text) + "\\"";`,
      `        },`,
      ``,
      `        "class": function(expectation) {`,
      `          var escapedParts = "",`,
      `              i;`,
      ``,
      `          for (i = 0; i < expectation.parts.length; i++) {`,
      `            escapedParts += expectation.parts[i] instanceof Array`,
      `              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])`,
      `              : classEscape(expectation.parts[i]);`,
      `          }`,
      ``,
      `          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";`,
      `        },`,
      ``,
      `        any: function(expectation) {`,
      `          return "any character";`,
      `        },`,
      ``,
      `        end: function(expectation) {`,
      `          return "end of input";`,
      `        },`,
      ``,
      `        other: function(expectation) {`,
      `          return expectation.description;`,
      `        }`,
      `      };`,
      ``,
      `  function hex(ch) {`,
      `    return ch.charCodeAt(0).toString(16).toUpperCase();`,
      `  }`,
      ``,
      `  function literalEscape(s) {`,
      `    return s`,
      `      .replace(/\\\\/g, '\\\\\\\\')`,   // backslash
      `      .replace(/"/g,  '\\\\"')`,        // closing double quote
      `      .replace(/\\0/g, '\\\\0')`,       // null
      `      .replace(/\\t/g, '\\\\t')`,       // horizontal tab
      `      .replace(/\\n/g, '\\\\n')`,       // line feed
      `      .replace(/\\r/g, '\\\\r')`,       // carriage return
      `      .replace(/[\\x00-\\x0F]/g,          function(ch) { return '\\\\x0' + hex(ch); })`,
      `      .replace(/[\\x10-\\x1F\\x7F-\\x9F]/g, function(ch) { return '\\\\x'  + hex(ch); });`,
      `  }`,
      ``,
      `  function classEscape(s) {`,
      `    return s`,
      `      .replace(/\\\\/g, '\\\\\\\\')`,   // backslash
      `      .replace(/\\]/g, '\\\\]')`,       // closing bracket
      `      .replace(/\\^/g, '\\\\^')`,       // caret
      `      .replace(/-/g,  '\\\\-')`,        // dash
      `      .replace(/\\0/g, '\\\\0')`,       // null
      `      .replace(/\\t/g, '\\\\t')`,       // horizontal tab
      `      .replace(/\\n/g, '\\\\n')`,       // line feed
      `      .replace(/\\r/g, '\\\\r')`,       // carriage return
      `      .replace(/[\\x00-\\x0F]/g,          function(ch) { return '\\\\x0' + hex(ch); })`,
      `      .replace(/[\\x10-\\x1F\\x7F-\\x9F]/g, function(ch) { return '\\\\x'  + hex(ch); });`,
      `  }`,
      ``,
      `  function describeExpectation(expectation) {`,
      `    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);`,
      `  }`,
      ``,
      `  function describeExpected(expected) {`,
      `    var descriptions = new Array(expected.length),`,
      `        i, j;`,
      ``,
      `    for (i = 0; i < expected.length; i++) {`,
      `      descriptions[i] = describeExpectation(expected[i]);`,
      `    }`,
      ``,
      `    descriptions.sort();`,
      ``,
      `    if (descriptions.length > 0) {`,
      `      for (i = 1, j = 1; i < descriptions.length; i++) {`,
      `        if (descriptions[i - 1] !== descriptions[i]) {`,
      `          descriptions[j] = descriptions[i];`,
      `          j++;`,
      `        }`,
      `      }`,
      `      descriptions.length = j;`,
      `    }`,
      ``,
      `    switch (descriptions.length) {`,
      `      case 1:`,
      `        return descriptions[0];`,
      ``,
      `      case 2:`,
      `        return descriptions[0] + " or " + descriptions[1];`,
      ``,
      `      default:`,
      `        return descriptions.slice(0, -1).join(", ")`,
      `          + ", or "`,
      `          + descriptions[descriptions.length - 1];`,
      `    }`,
      `  }`,
      ``,
      `  function describeFound(found) {`,
      `    return found ? "\\"" + literalEscape(found) + "\\"" : "end of input";`,
      `  }`,
      ``,
      `  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";`,
      `};`,
      ``,
    ].join(`\n`));

    if (options.trace) {
      parts.push([
        `function peg$DefaultTracer() {`,
        `  this.indentLevel = 0;`,
        `}`,
        ``,
        `peg$DefaultTracer.prototype.trace = function(event) {`,
        `  var that = this;`,
        ``,
        `  function log(event) {`,
        `    function repeat(string, n) {`,
        `       var result = "", i;`,
        ``,
        `       for (i = 0; i < n; i++) {`,
        `         result += string;`,
        `       }`,
        ``,
        `       return result;`,
        `    }`,
        ``,
        `    function pad(string, length) {`,
        `      return string + repeat(" ", length - string.length);`,
        `    }`,
        ``,
        `    if (typeof console === "object") {`,   // IE 8-10
        `      console.log(`,
        `        event.location.start.line + ":" + event.location.start.column + "-"`,
        `          + event.location.end.line + ":" + event.location.end.column + " "`,
        `          + pad(event.type, 10) + " "`,
        `          + repeat("  ", that.indentLevel) + event.rule`,
        `      );`,
        `    }`,
        `  }`,
        ``,
        `  switch (event.type) {`,
        `    case "rule.enter":`,
        `      log(event);`,
        `      this.indentLevel++;`,
        `      break;`,
        ``,
        `    case "rule.match":`,
        `      this.indentLevel--;`,
        `      log(event);`,
        `      break;`,
        ``,
        `    case "rule.fail":`,
        `      this.indentLevel--;`,
        `      log(event);`,
        `      break;`,
        ``,
        `    default:`,
        `      throw new Error("Invalid event type: " + event.type + ".");`,
        `  }`,
        `};`,
        ``,
      ].join(`\n`));
    }

    parts.push([
      `function peg$parse(input, options) {`,
      `  options = options !== void 0 ? options : {};`,
      ``,
      `  var peg$FAILED = {},`,
      ``,
    ].join(`\n`));

    const startRuleFunction = `peg$parse${options.allowedStartRules[0]}`;
    const startRuleFunctions = `{ ${options.allowedStartRules.map(r => {
      return `${r}: peg$parse${r}`;
    }).join(`, `)} }`;

    parts.push([
      `      peg$startRuleFunctions = ${startRuleFunctions},`,
      `      peg$startRuleFunction  = ${startRuleFunction},`,
    ].join(`\n`));

    parts.push(``);
    parts.push(indent6(generateTables()));
    parts.push([
      ``,
      `      peg$currPos            = 0,`,
      `      peg$savedPos           = 0,`,
      `      peg$posDetailsCache    = [{ line: 1, column: 1 }],`,
      `      peg$maxFailPos         = 0,`,
      `      peg$maxFailExpected    = [],`,
      `      peg$scopes             = [],`,
      `      peg$transactions       = [],`,
      `      peg$currentTransaction = undefined,`,
      `      peg$silentFails        = 0,`,   // 0 = report failures, > 0 = silence failures
      ``,
    ].join(`\n`));

    if (options.cache) {
      parts.push([
        `      peg$resultsCache = {},`,
        ``,
      ].join(`\n`));
    }

    if (options.trace) {
      parts.push([
        `      peg$tracer = "tracer" in options ? options.tracer : new peg$DefaultTracer(),`,
        ``,
      ].join(`\n`));
    }

    parts.push([
      `      peg$result;`,
      ``,
    ].join(`\n`));

    parts.push([
      `  if ("startRule" in options) {`,
      `    if (!(options.startRule in peg$startRuleFunctions)) {`,
      `      throw new Error("Can't start parsing from rule \\"" + options.startRule + "\\".");`,
      `    }`,
      ``,
      `    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];`,
      `  }`,
    ].join(`\n`));

    parts.push([
      ``,
      `  var transforms = [];`,
      ``,
      `  function literal(str) {`,
      `    return str;`,
      `  }`,
      ``,
      `  function tuple(arr) {`,
      `    return arr;`,
      `  }`,
      ``,
      `  function text() {`,
      `    return input.substring(peg$savedPos, peg$currPos);`,
      `  }`,
      ``,
      `  function location() {`,
      `    return peg$computeLocation(peg$savedPos, peg$currPos);`,
      `  }`,
      ``,
      `  function onRollback(fn) {`,
    ].join(`\n`));

    parts.push(options.cache
      ? `    throw new Error('Parsing transactions can\\'t be used if the cache is enabled');`
      : `    peg$transactions[0]?.unshift(fn);`);

    parts.push([
      ``,
      `    `,
      `  }`,
      ``,
      `  function expected(description, location) {`,
      `    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)`,
      ``,
      `    throw peg$buildStructuredError(`,
      `      [peg$otherExpectation(description)],`,
      `      input.substring(peg$savedPos, peg$currPos),`,
      `      location`,
      `    );`,
      `  }`,
      ``,
      `  function error(message, location) {`,
      `    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)`,
      ``,
      `    throw peg$buildSimpleError(message, location);`,
      `  }`,
      ``,
      `  function peg$literalExpectation(text, ignoreCase) {`,
      `    return { type: "literal", text: text, ignoreCase: ignoreCase };`,
      `  }`,
      ``,
      `  function peg$classExpectation(parts, inverted, ignoreCase) {`,
      `    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };`,
      `  }`,
      ``,
      `  function peg$anyExpectation() {`,
      `    return { type: "any" };`,
      `  }`,
      ``,
      `  function peg$endExpectation() {`,
      `    return { type: "end" };`,
      `  }`,
      ``,
      `  function peg$otherExpectation(description) {`,
      `    return { type: "other", description: description };`,
      `  }`,
      ``,
      `  function peg$computePosDetails(pos) {`,
      `    var details = peg$posDetailsCache[pos], p;`,
      ``,
      `    if (details) {`,
      `      return details;`,
      `    } else {`,
      `      p = pos - 1;`,
      `      while (!peg$posDetailsCache[p]) {`,
      `        p--;`,
      `      }`,
      ``,
      `      details = peg$posDetailsCache[p];`,
      `      details = {`,
      `        line:   details.line,`,
      `        column: details.column`,
      `      };`,
      ``,
      `      while (p < pos) {`,
      `        if (input.charCodeAt(p) === 10) {`,
      `          details.line++;`,
      `          details.column = 1;`,
      `        } else {`,
      `          details.column++;`,
      `        }`,
      ``,
      `        p++;`,
      `      }`,
      ``,
      `      peg$posDetailsCache[pos] = details;`,
      `      return details;`,
      `    }`,
      `  }`,
      ``,
      `  function peg$computeLocation(startPos, endPos) {`,
      `    var startPosDetails = peg$computePosDetails(startPos),`,
      `        endPosDetails   = peg$computePosDetails(endPos);`,
      ``,
      `    return {`,
      `      start: {`,
      `        offset: startPos,`,
      `        line:   startPosDetails.line,`,
      `        column: startPosDetails.column`,
      `      },`,
      `      end: {`,
      `        offset: endPos,`,
      `        line:   endPosDetails.line,`,
      `        column: endPosDetails.column`,
      `      }`,
      `    };`,
      `  }`,
      ``,
      `  function peg$fail(expected) {`,
      `    if (peg$currPos < peg$maxFailPos) { return; }`,
      ``,
      `    if (peg$currPos > peg$maxFailPos) {`,
      `      peg$maxFailPos = peg$currPos;`,
      `      peg$maxFailExpected = [];`,
      `    }`,
      ``,
      `    peg$maxFailExpected.push(expected);`,
      `  }`,
      ``,
      `  function peg$buildSimpleError(message, location) {`,
      `    return new peg$SyntaxError(message, null, null, location);`,
      `  }`,
      ``,
      `  function peg$inferToken(tokenStart) {`,
      `    if (tokenStart >= input.length) return null;`,
      ``,
      `    var regex = /\\W/g;`,
      `    regex.lastIndex = tokenStart;`,
      ``,
      `    var match = regex.exec(input);`,
      `    var tokenEnd = match ? match.index : input.length;`,
      `    var suffix = tokenEnd - tokenStart > 20 ? '...' : '';`,
      ``,
      `    tokenEnd = Math.min(tokenEnd, tokenStart + 20) - suffix.length;`,
      `    tokenEnd = Math.max(tokenStart + 1, tokenEnd);`,
      ``,
      `    return input.slice(tokenStart, tokenEnd) + suffix;`,
      `  }`,
      ``,
      `  function peg$buildStructuredError(expected, found, location) {`,
      `    return new peg$SyntaxError(`,
      `      peg$SyntaxError.buildMessage(expected, found),`,
      `      expected,`,
      `      found,`,
      `      location`,
      `    );`,
      `  }`,
      ``,
    ].join(`\n`));

    for (const rule of ast.rules) {
      parts.push(indent2(generateRuleFunction(rule)));
      parts.push(``);
    }

    if (ast.initializer) {
      parts.push(indent2(ast.initializer.code));
      parts.push(``);
    }

    parts.push(`  peg$result = peg$startRuleFunction();`);

    parts.push([
      ``,
      `  if (peg$result !== peg$FAILED && peg$currPos === input.length) {`,
      `    return transforms.reduce((value, transform) => transform(value), peg$result);`,
      `  } else {`,
      `    if (peg$result !== peg$FAILED && peg$currPos < input.length) {`,
      `      peg$fail(peg$endExpectation());`,
      `    }`,
      ``,
      `    var invalidToken = peg$inferToken(peg$maxFailPos);`,
      ``,
      `    throw peg$buildStructuredError(`,
      `      peg$maxFailExpected,`,
      `      invalidToken,`,
      `      invalidToken`,
      `        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + invalidToken.length)`,
      `        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)`,
      `    );`,
      `  }`,
      `}`,
    ].join(`\n`));

    return parts.join(`\n`);
  }

  function generateWrapper(toplevelCode: string) {
    function generateGeneratedByComment() {
      return [
        `/*`,
        ` * Generated by PEG.js ${VERSION}.`,
        ` *`,
        ` * http://pegjs.org/`,
        ` */`,
      ].join(`\n`);
    }

    function generateParserObject() {
      return options.trace
        ? [
          `{`,
          `  SyntaxError:   peg$SyntaxError,`,
          `  DefaultTracer: peg$DefaultTracer,`,
          `  parse:         peg$parse`,
          `}`,
        ].join(`\n`)
        : [
          `{`,
          `  SyntaxError: peg$SyntaxError,`,
          `  parse:       peg$parse`,
          `}`,
        ].join(`\n`);
    }

    var generators = {
      typescript() {
        return [
          generateGeneratedByComment(),
          toplevelCode,
          ``,
          indent2(`export ${generateParserObject()};`),
        ].join(`\n`);
      },

      bare() {
        return [
          generateGeneratedByComment(),
          `(function() {`,
          `  "use strict";`,
          ``,
          indent2(toplevelCode),
          ``,
          indent2(`return ${generateParserObject()};`),
          `})()`,
        ].join(`\n`);
      },

      commonjs() {
        var parts          = [],
          dependencyVars = Object.keys(options.dependencies),
          requires       = dependencyVars.map(
            variable => {
              return `${variable
              } = require("${
                js.stringEscape(options.dependencies[variable])
              }")`;
            },
          );

        parts.push([
          generateGeneratedByComment(),
          ``,
          `"use strict";`,
          ``,
        ].join(`\n`));

        if (requires.length > 0) {
          parts.push(`var ${requires.join(`, `)};`);
          parts.push(``);
        }

        parts.push([
          toplevelCode,
          ``,
          `module.exports = ${generateParserObject()};`,
          ``,
        ].join(`\n`));

        return parts.join(`\n`);
      },

      amd() {
        var dependencyIds  = Object.values(options.dependencies),
          dependencyVars = Object.keys(options.dependencies),
          dependencies   = `[${
            dependencyIds.map(
              id => {
                return `"${js.stringEscape(id)}"`;
              },
            ).join(`, `)
          }]`,
          params         = dependencyVars.join(`, `);

        return [
          generateGeneratedByComment(),
          `define(${dependencies}, function(${params}) {`,
          `  "use strict";`,
          ``,
          indent2(toplevelCode),
          ``,
          indent2(`return ${generateParserObject()};`),
          `});`,
          ``,
        ].join(`\n`);
      },

      globals() {
        return [
          generateGeneratedByComment(),
          `(function(root) {`,
          `  "use strict";`,
          ``,
          indent2(toplevelCode),
          ``,
          indent2(`root.${options.exportVar} = ${generateParserObject()};`),
          `})(this);`,
          ``,
        ].join(`\n`);
      },

      umd() {
        var parts          = [],
          dependencyIds  = Object.values(options.dependencies),
          dependencyVars = Object.keys(options.dependencies),
          dependencies   = `[${
            dependencyIds.map(
              id => {
                return `"${js.stringEscape(id)}"`;
              },
            ).join(`, `)
          }]`,
          requires       = dependencyIds.map(
            id => {
              return `require("${js.stringEscape(id)}")`;
            },
          ).join(`, `),
          params         = dependencyVars.join(`, `);

        parts.push([
          generateGeneratedByComment(),
          `(function(root, factory) {`,
          `  if (typeof define === "function" && define.amd) {`,
          `    define(${dependencies}, factory);`,
          `  } else if (typeof module === "object" && module.exports) {`,
          `    module.exports = factory(${requires});`,
        ].join(`\n`));

        if (options.exportVar !== null) {
          parts.push([
            `  } else {`,
            `    root.${options.exportVar} = factory();`,
          ].join(`\n`));
        }

        parts.push([
          `  }`,
          `})(this, function(${params}) {`,
          `  "use strict";`,
          ``,
          indent2(toplevelCode),
          ``,
          indent2(`return ${generateParserObject()};`),
          `});`,
          ``,
        ].join(`\n`));

        return parts.join(`\n`);
      },
    };

    return generators[options.format]();
  }

  ast.code = generateWrapper(generateToplevel());
}
