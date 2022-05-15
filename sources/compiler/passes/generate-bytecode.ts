import { GrammarError } from '../../grammar-error';
import * as asts          from '../asts';
import * as js            from '../js';
import * as op            from '../opcodes';
import {VisitFn, visitor} from '../visitor';

export type Bytecode = Array<number>;

export type Context = {
  sp: number;
  env: Record<string, number>;
  action: asts.Action | null;
};

/* Generates bytecode.
 *
 * Instructions
 * ============
 *
 * Stack Manipulation
 * ------------------
 *
 *  [0] PUSH c
 *
 *        stack.push(consts[c]);
 *
 *  [1] PUSH_UNDEFINED
 *
 *        stack.push(undefined);
 *
 *  [2] PUSH_NULL
 *
 *        stack.push(null);
 *
 *  [3] PUSH_FAILED
 *
 *        stack.push(FAILED);
 *
 *  [4] PUSH_EMPTY_ARRAY
 *
 *        stack.push([]);
 *
 *  [5] PUSH_CURR_POS
 *
 *        stack.push(currPos);
 *
 *  [6] POP
 *
 *        stack.pop();
 *
 *  [7] POP_CURR_POS
 *
 *        currPos = stack.pop();
 *
 *  [8] POP_N n
 *
 *        stack.pop(n);
 *
 *  [9] NIP
 *
 *        value = stack.pop();
 *        stack.pop();
 *        stack.push(value);
 *
 * [10] APPEND
 *
 *        value = stack.pop();
 *        array = stack.pop();
 *        array.push(value);
 *        stack.push(array);
 *
 * [11] WRAP n
 *
 *        stack.push(stack.pop(n));
 *
 * [12] TEXT
 *
 *        stack.push(input.substring(stack.pop(), currPos));
 *
 * Conditions and Loops
 * --------------------
 *
 * [13] IF t, f
 *
 *        if (stack.top()) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [14] IF_ERROR t, f
 *
 *        if (stack.top() === FAILED) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [15] IF_NOT_ERROR t, f
 *
 *        if (stack.top() !== FAILED) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [16] WHILE_NOT_ERROR b
 *
 *        while(stack.top() !== FAILED) {
 *          interpret(ip + 2, ip + 2 + b);
 *        }
 *
 * Matching
 * --------
 *
 * [17] MATCH_ANY a, f, ...
 *
 *        if (input.length > currPos) {
 *          interpret(ip + 3, ip + 3 + a);
 *        } else {
 *          interpret(ip + 3 + a, ip + 3 + a + f);
 *        }
 *
 * [18] MATCH_STRING s, a, f, ...
 *
 *        if (input.substr(currPos, consts[s].length) === consts[s]) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [19] MATCH_STRING_IC s, a, f, ...
 *
 *        if (input.substr(currPos, consts[s].length).toLowerCase() === consts[s]) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [20] MATCH_REGEXP r, a, f, ...
 *
 *        if (consts[r].test(input.charAt(currPos))) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [21] ACCEPT_N n
 *
 *        stack.push(input.substring(currPos, n));
 *        currPos += n;
 *
 * [22] ACCEPT_STRING s
 *
 *        stack.push(consts[s]);
 *        currPos += consts[s].length;
 *
 * [23] FAIL e
 *
 *        stack.push(FAILED);
 *        fail(consts[e]);
 *
 * Calls
 * -----
 *
 * [24] LOAD_SAVED_POS p
 *
 *        savedPos = stack[p];
 *
 * [25] UPDATE_SAVED_POS
 *
 *        savedPos = currPos;
 *
 * [26] CALL f, n, pc, p1, p2, ..., pN
 *
 *        value = consts[f](stack[p1], ..., stack[pN]);
 *        stack.pop(n);
 *        stack.push(value);
 *
 * Rules
 * -----
 *
 * [27] RULE r
 *
 *        stack.push(parseRule(r));
 *
 * Failure Reporting
 * -----------------
 *
 * [28] SILENT_FAILS_ON
 *
 *        silentFails++;
 *
 * [29] SILENT_FAILS_OFF
 *
 *        silentFails--;
 */
export function generateBytecode(ast: asts.Ast) {
  const consts: Array<string> = [];

  function addConst(value: string) {
    const existingIndex = consts.indexOf(value);

    const index = existingIndex === -1
      ? consts.push(value) - 1
      : existingIndex;

    return index;
  }

  function addFunctionConst(params: Array<string>, code: string) {
    return addConst(`function(${params.join(`, `)}) {${code}}`);
  }

  function buildSequence(...segments: Array<Bytecode>) {
    return ([] as Bytecode).concat(...segments);
  }

  function buildCondition(condCode: Bytecode, thenCode: Bytecode, elseCode: Bytecode = []) {
    return condCode.concat([thenCode.length, elseCode.length], thenCode, elseCode);
  }

  function buildLoop(condCode: Bytecode, bodyCode: Bytecode) {
    return condCode.concat([bodyCode.length], bodyCode);
  }

  function buildTransaction(bodyCode: Bytecode) {
    return buildSequence(
      [op.BEGIN_TRANSACTION],
      bodyCode,
      buildCondition(
        [op.IF_NOT_ERROR],
        [op.COMMIT_TRANSACTION],
        [op.ROLLBACK_TRANSACTION],
      ),
    );
  }

  function buildCall(functionIndex: number, delta: number, env: Record<string, number>, sp: number) {
    const params = Object.values(env).map(p => sp - p);

    return [op.CALL, functionIndex, delta, params.length].concat(params);
  }

  function buildEnterScope(functionIndex: number, delta: number, env: Record<string, number>, sp: number) {
    const params = Object.values(env).map(p => sp - p);

    return [op.ENTER_SCOPE, functionIndex, delta, params.length].concat(params);
  }

  function buildSimplePredicate(visit: VisitFn, expression: asts.Expression, negative: boolean, context: Context) {
    const compiledExpression = visit(expression, {
      sp: context.sp + 1,
      env: {...context.env},
      action: null,
    });

    const compiledCondition = buildCondition(
      [negative ? op.IF_ERROR : op.IF_NOT_ERROR],
      buildSequence(
        [op.POP],
        [negative ? op.POP : op.POP_CURR_POS],
        [op.PUSH_UNDEFINED],
      ),
      buildSequence(
        [op.POP],
        [negative ? op.POP_CURR_POS : op.POP],
        [op.PUSH_FAILED],
      ),
    );

    return buildSequence(
      [op.PUSH_CURR_POS],
      [op.SILENT_FAILS_ON],
      compiledExpression,
      [op.SILENT_FAILS_OFF],
      compiledCondition,
    );
  }

  function buildSemanticPredicate(code: string, negative: boolean, context: Context) {
    const functionIndex = addFunctionConst(Object.keys(context.env), code);

    const compiledCall = buildCall(functionIndex, 0, context.env, context.sp);
    const compiledCondition = buildCondition(
      [op.IF],
      buildSequence(
        [op.POP],
        negative ? [op.PUSH_FAILED] : [op.PUSH_UNDEFINED],
      ),
      buildSequence(
        [op.POP],
        negative ? [op.PUSH_UNDEFINED] : [op.PUSH_FAILED],
      ),
    );

    return buildSequence(
      [op.UPDATE_SAVED_POS],
      compiledCall,
      compiledCondition,
    );
  }

  function buildAppendLoop(expressionCode: Bytecode) {
    return buildLoop(
      [op.WHILE_NOT_ERROR],
      buildSequence([op.APPEND], expressionCode),
    );
  }

  const baseGenerate = visitor.build({
    grammar(visit, node) {
      for (const rule of node.rules)
        visit(rule);

      node.consts = consts;
    },

    rule(visit, node) {
      node.bytecode = visit(node.expression, {
        sp: -1,       // stack pointer
        env: { },     // mapping of label names to stack positions
        action: null, // action nodes pass themselves to children here
      });
    },

    named(visit, node, context: Context) {
      const nameIndex = addConst(
        `peg$otherExpectation("${js.stringEscape(node.name)}")`,
      );

      /*
       * The code generated below is slightly suboptimal because |FAIL| pushes
       * to the stack, so we need to stick a |POP| in front of it. We lack a
       * dedicated instruction that would just report the failure and not touch
       * the stack.
       */
      return buildSequence(
        [op.SILENT_FAILS_ON],
        visit(node.expression, context),
        [op.SILENT_FAILS_OFF],
        buildCondition(
          [op.IF_ERROR],
          [op.FAIL, nameIndex],
        ),
      );
    },

    choice(visit, node, context: Context) {
      function buildAlternativesCode([head, ...rest]: Array<asts.Node>, context: Context): Bytecode {
        const compiledFirstAlternative = visit(head, {
          sp: context.sp,
          env: {...context.env},
          action: null,
        });

        const compiledTransaction = buildTransaction(
          compiledFirstAlternative,
        );

        // The last choice doesn't run within a dedicated transaction
        const compiledSubject = rest.length > 0
          ? compiledTransaction
          : compiledFirstAlternative;

        const compiledRemainingAlternatives = rest.length > 0 && buildCondition(
          [op.IF_ERROR],
          buildSequence(
            [op.POP],
            buildAlternativesCode(rest, context),
          ),
        );

        return buildSequence(
          compiledSubject,
          compiledRemainingAlternatives || [],
        );
      }

      return buildAlternativesCode(node.alternatives, context);
    },

    action(visit, node, context: Context) {
      const env = {...context.env};

      const emitCall = node.expression.type !== `sequence` || node.expression.elements.length === 0;
      const expressionCode = visit(node.expression, {
        sp: context.sp + (emitCall ? 1 : 0),
        env,
        action: node,
      });

      const functionIndex = addFunctionConst(Object.keys(env), node.code);

      const production = emitCall
        ? buildSequence(
          [op.PUSH_CURR_POS],
          expressionCode,
          buildCondition(
            [op.IF_NOT_ERROR],
            buildSequence(
              [op.LOAD_SAVED_POS, 1],
              buildCall(functionIndex, 1, env, context.sp + 2),
            ),
            [],
          ),
          [op.NIP],
        )
        : expressionCode;

      return production;
    },

    scope(visit, node, context: Context) {
      const env = {...context.env};
      const functionIndex = addFunctionConst(Object.keys(env), node.code);

      const expressionCode = visit(node.expression, {
        sp: context.sp,
        env: context.env,
        action: null,
      });

      return buildSequence(
        buildEnterScope(functionIndex, 0, env, context.sp),
        expressionCode,
        [op.EXIT_SCOPE],
      );
    },

    transform(visit, node, context: Context) {
      const env = {...context.env, current: context.sp + 2};
      const functionIndex = addFunctionConst(Object.keys(env), node.code);

      const expressionCode = visit(node.expression, {
        sp: context.sp + 1,
        env: context.env,
        action: null,
      });

      return buildSequence(
        [op.PUSH_CURR_POS],
        expressionCode,
        buildCondition(
          [op.IF_NOT_ERROR],
          buildSequence(
            [op.LOAD_SAVED_POS, 1],
            buildCall(functionIndex, 1, env, context.sp + 2),
          ),
          [],
        ),
        [op.NIP],
      );
    },

    sequence(visit, node, context: Context) {
      if (!context.action) {
        const labeledElements = node.elements.filter((child): child is asts.Labeled => {
          return child.type === `labeled`;
        });

        if (labeledElements.length > 0) {
          const anonymousOutputs = labeledElements.filter(child => {
            return child.label === null;
          });

          if (anonymousOutputs.length !== 0 && anonymousOutputs.length !== labeledElements.length) {
            throw new GrammarError(
              `Anonymous and named outputs cannot be mixed inside the same sequence.`,
              node.location,
            );
          }

          if (anonymousOutputs.length === 0) {
            return visit({
              type: `action`,
              location: node.location,
              code: `return {${labeledElements.map(child => child.label!).join(`, `)}}`,
              expression: node,
            }, context);
          } else {
            let labelIndex = 0;

            const code = labeledElements.length === 1
              ? `return value${labelIndex}`
              : `return [${labeledElements.map((child, i) => `value${i}`).join(`, `)}]`;

            return visit({
              type: `action`,
              location: node.location,
              code,
              expression: {
                type: `sequence`,
                location: node.location,
                elements: node.elements.map(child => {
                  return child.type === `labeled` ? {...child, label: `value${labelIndex++}`} : child;
                }),
              },
            }, context);
          }
        }
      }

      function buildElementsCode(elements: Array<asts.Expression>, context: Context): Bytecode {
        if (elements.length > 0) {
          const processedCount = node.elements.length - elements.slice(1).length;

          return buildSequence(
            visit(elements[0], {
              sp: context.sp,
              env: context.env,
              action: null,
            }),
            buildCondition(
              [op.IF_NOT_ERROR],
              buildElementsCode(elements.slice(1), {
                sp: context.sp + 1,
                env: context.env,
                action: context.action,
              }),
              buildSequence(
                processedCount > 1 ? [op.POP_N, processedCount] : [op.POP],
                [op.POP_CURR_POS],
                [op.PUSH_FAILED],
              ),
            ),
          );
        } else {
          if (context.action) {
            const functionIndex = addFunctionConst(
              Object.keys(context.env),
              context.action.code,
            );

            return buildSequence(
              [op.LOAD_SAVED_POS, node.elements.length],
              buildCall(
                functionIndex,
                node.elements.length,
                context.env,
                context.sp,
              ),
              [op.NIP],
            );
          } else {
            return buildSequence([op.WRAP, node.elements.length], [op.NIP]);
          }
        }
      }

      return buildSequence(
        [op.PUSH_CURR_POS],
        buildElementsCode(node.elements, {
          sp: context.sp + 1,
          env: context.env,
          action: context.action,
        }),
      );
    },

    labeled(visit, node, context: Context) {
      const env = {...context.env};

      if (node.label !== null)
        context.env[node.label] = context.sp + 1;

      return visit(node.expression, {
        sp: context.sp,
        env,
        action: null,
      });
    },

    text(visit, node, context: Context) {
      const compiledExpression = visit(node.expression, {
        sp: context.sp + 1,
        env: {...context.env},
        action: null,
      });

      const compiledCondition = buildCondition(
        [op.IF_NOT_ERROR],
        buildSequence([op.POP], [op.TEXT]),
        [op.NIP],
      );

      return buildSequence(
        [op.PUSH_CURR_POS],
        compiledExpression,
        compiledCondition,
      );
    },

    simpleAnd(visit, node, context: Context) {
      return buildSimplePredicate(visit, node.expression, false, context);
    },

    simpleNot(visit, node, context: Context) {
      return buildSimplePredicate(visit, node.expression, true, context);
    },

    optional(visit, node, context: Context) {
      const compiledExpression = buildTransaction(
        visit(node.expression, {
          sp: context.sp,
          env: {...context.env},
          action: null,
        }),
      );

      const compiledCondition = buildCondition(
        [op.IF_ERROR],
        buildSequence([op.POP], [op.PUSH_NULL]),
        [],
      );

      return buildSequence(
        compiledExpression,
        compiledCondition,
      );
    },

    zeroOrMore(visit, node, context: Context) {
      const compiledExpression = buildTransaction(
        visit(node.expression, {
          sp: context.sp + 1,
          env: {...context.env},
          action: null,
        }),
      );

      return buildSequence(
        [op.PUSH_EMPTY_ARRAY],
        compiledExpression,
        buildAppendLoop(compiledExpression),
        [op.POP],
      );
    },

    oneOrMore(visit, node, context: Context) {
      const compiledExpression = visit(node.expression, {
        sp: context.sp + 1,
        env: {...context.env},
        action: null,
      });

      const compiledTransaction = buildTransaction(
        compiledExpression,
      );

      return buildSequence(
        [op.PUSH_EMPTY_ARRAY],
        compiledExpression,
        buildCondition(
          [op.IF_NOT_ERROR],
          buildSequence(buildAppendLoop(compiledTransaction), [op.POP]),
          buildSequence([op.POP], [op.POP], [op.PUSH_FAILED]),
        ),
      );
    },

    group(visit, node, context: Context) {
      return visit(node.expression, {
        sp: context.sp,
        env: {...context.env},
        action: null,
      });
    },

    semanticAnd(visit, node, context: Context) {
      return buildSemanticPredicate(node.code, false, context);
    },

    semanticNot(visit, node, context: Context) {
      return buildSemanticPredicate(node.code, true, context);
    },

    ruleRef(visit, node) {
      return [op.RULE, asts.indexOfRule(ast, node.name)];
    },

    literal(visit, node) {
      if (node.value.length === 0)
        return [op.PUSH, addConst(`""`)];

      const stringIndex = addConst(`"${js.stringEscape(node.ignoreCase ? node.value.toLowerCase() : node.value)}"`);
      const expectedIndex = addConst(`peg$literalExpectation("${js.stringEscape(node.value)}", ${node.ignoreCase})`);

      const compiledCondition = node.ignoreCase
        ? [op.MATCH_STRING_IC, stringIndex]
        : [op.MATCH_STRING, stringIndex];

      const compiledThen = node.ignoreCase
        ? [op.ACCEPT_N, node.value.length]
        : [op.ACCEPT_STRING, stringIndex];

      /*
        * For case-sensitive strings the value must match the beginning of the
        * remaining input exactly. As a result, we can use |ACCEPT_STRING| and
        * save one |substr| call that would be needed if we used |ACCEPT_N|.
        */
      return buildCondition(
        compiledCondition,
        compiledThen,
        [op.FAIL, expectedIndex],
      );
    },

    class(visit, node) {
      const prefix = node.inverted ? `^` : ``;
      const flags = node.ignoreCase ? `i` : ``;

      const range = node.parts.map(part => {
        return Array.isArray(part)
          ? `${js.regexpClassEscape(part[0])
          }-${
            js.regexpClassEscape(part[1])}`
          : js.regexpClassEscape(part);
      }).join(``);

      const regexp = `/^[${prefix}${range}]/${flags}`;

      const regexpIndex = addConst(regexp);
      const expectedIndex = addConst(`peg$classExpectation(${JSON.stringify(node.parts)}, ${node.inverted}, ${node.ignoreCase})`);

      return buildCondition(
        [op.MATCH_REGEXP, regexpIndex],
        [op.ACCEPT_N, 1],
        [op.FAIL, expectedIndex],
      );
    },

    any() {
      const expectedIndex = addConst(`peg$anyExpectation()`);

      return buildCondition(
        [op.MATCH_ANY],
        [op.ACCEPT_N, 1],
        [op.FAIL, expectedIndex],
      );
    },
  });

  const generate = (ast: asts.Node, context?: Context) => {
    return baseGenerate(ast, context);
  };

  generate(ast);
}
