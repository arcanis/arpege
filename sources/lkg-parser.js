/* eslint-disable */

"use strict";

function peg$subclass(child, parent) {
  function ctor() {
    this.constructor = child;
  }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  if (location)
    message = message.replace(
      /\.$/,
      " at line " +
        location.start.line +
        ", column " +
        location.start.column +
        ".",
    );

  this.message = message;
  this.expected = expected;
  this.found = found;
  this.location = location;
  this.name = "PegSyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function (expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function (expectation) {
      return '"' + literalEscape(expectation.text) + '"';
    },

    class: function (expectation) {
      var escapedParts = "",
        i;

      for (i = 0; i < expectation.parts.length; i++) {
        escapedParts +=
          expectation.parts[i] instanceof Array
            ? classEscape(expectation.parts[i][0]) +
              "-" +
              classEscape(expectation.parts[i][1])
            : classEscape(expectation.parts[i]);
      }

      return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
    },

    any: function (expectation) {
      return "any character";
    },

    end: function (expectation) {
      return "end of input";
    },

    other: function (expectation) {
      return expectation.description;
    },
  };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g, function (ch) {
        return "\\x0" + hex(ch);
      })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
        return "\\x" + hex(ch);
      });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\^/g, "\\^")
      .replace(/-/g, "\\-")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g, function (ch) {
        return "\\x0" + hex(ch);
      })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
        return "\\x" + hex(ch);
      });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
      i,
      j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return (
          descriptions.slice(0, -1).join(", ") +
          ", or " +
          descriptions[descriptions.length - 1]
        );
    }
  }

  function describeFound(found) {
    return found ? '"' + literalEscape(found) + '"' : "end of input";
  }

  return (
    "Expected " +
    describeExpected(expected) +
    " but " +
    describeFound(found) +
    " found."
  );
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},
    peg$startRuleFunctions = { Grammar: peg$parseGrammar },
    peg$startRuleFunction = peg$parseGrammar,
    peg$c0 = function (value0) {
      return value0;
    },
    peg$c1 = function (initializer, value0) {
      return value0;
    },
    peg$c2 = function (initializer, rules) {
      {
        return {
          type: `grammar`,
          location: location(),
          initializer,
          rules,
        };
      }
    },
    peg$c3 = function (code) {
      {
        return {
          type: `initializer`,
          location: location(),
          code: code,
        };
      }
    },
    peg$c4 = function (head, value) {
      return value;
    },
    peg$c5 = function (head, tail) {
      return [head, ...tail];
    },
    peg$c6 = function (value) {
      return value ?? [];
    },
    peg$c7 = function (annotations, name, value0) {
      return value0;
    },
    peg$c8 = "=",
    peg$c9 = peg$literalExpectation("=", false),
    peg$c10 = function (annotations, name, displayName, expression) {
      const expressionWithAnnotations =
        annotations.length === 0
          ? expression
          : {
              ...expression,
              annotations,
            };

      return {
        type: `rule`,
        location: location(),
        name,
        expression:
          displayName === null
            ? expressionWithAnnotations
            : {
                type: `named`,
                location: location(),
                name: displayName,
                expression: expressionWithAnnotations,
              },
      };
    },
    peg$c11 = "/",
    peg$c12 = peg$literalExpectation("/", false),
    peg$c13 = function (alternatives) {
      return alternatives.length === 1
        ? alternatives[0]
        : {
            type: `choice`,
            location: location(),
            alternatives,
          };
    },
    peg$c14 = function (annotations, expression) {
      return annotations.length === 0
        ? expression
        : {
            ...expression,
            annotations,
          };
    },
    peg$c15 = "^",
    peg$c16 = peg$literalExpectation("^", false),
    peg$c17 = function (expression, code) {
      {
        return {
          type: `scope`,
          location: location(),
          code,
          expression,
        };
      }
    },
    peg$c18 = function (expression, code) {
      {
        return {
          type: `action`,
          location: location(),
          code: code ?? ``,
          expression,
        };
      }
    },
    peg$c19 = function (elements) {
      return elements.length === 1
        ? elements[0]
        : {
            type: `sequence`,
            location: location(),
            elements,
          };
    },
    peg$c20 = ":",
    peg$c21 = peg$literalExpectation(":", false),
    peg$c22 = function (label, expression) {
      {
        return {
          type: `labeled`,
          location: location(),
          label,
          expression,
        };
      }
    },
    peg$c23 = "::",
    peg$c24 = peg$literalExpectation("::", false),
    peg$c25 = function (expression) {
      {
        return {
          type: `labeled`,
          location: location(),
          label: null,
          expression,
        };
      }
    },
    peg$c26 = function (operator, expression) {
      {
        return {
          type: OPS_TO_PREFIXED_TYPES[operator],
          location: location(),
          expression,
        };
      }
    },
    peg$c27 = "$",
    peg$c28 = peg$literalExpectation("$", false),
    peg$c29 = "&",
    peg$c30 = peg$literalExpectation("&", false),
    peg$c31 = "!",
    peg$c32 = peg$literalExpectation("!", false),
    peg$c33 = function (expression, operator) {
      {
        return {
          type: OPS_TO_SUFFIXED_TYPES[operator],
          location: location(),
          expression,
        };
      }
    },
    peg$c34 = "?",
    peg$c35 = peg$literalExpectation("?", false),
    peg$c36 = "*",
    peg$c37 = peg$literalExpectation("*", false),
    peg$c38 = "+",
    peg$c39 = peg$literalExpectation("+", false),
    peg$c40 = "(",
    peg$c41 = peg$literalExpectation("(", false),
    peg$c42 = ")",
    peg$c43 = peg$literalExpectation(")", false),
    peg$c44 = function (expression) {
      /*
       * The purpose of the `group` AST node is just to isolate label scope. We
       * don`t need to put it around nodes that can`t contain any labels or
       * nodes that already isolate label scope themselves. This leaves us with
       * `labeled` and `sequence`.
       */
      return expression.type === `labeled` || expression.type === `sequence`
        ? { type: `group`, expression: expression }
        : expression;
    },
    peg$c45 = ">",
    peg$c46 = peg$literalExpectation(">", false),
    peg$c47 = function (name) {
      {
        return {
          type: `ruleRef`,
          location: location(),
          name,
        };
      }
    },
    peg$c48 = function (operator, code) {
      {
        return {
          type: OPS_TO_SEMANTIC_PREDICATE_TYPES[operator],
          location: location(),
          code,
        };
      }
    },
    peg$c49 = peg$anyExpectation(),
    peg$c50 = peg$otherExpectation("whitespace"),
    peg$c51 = "\t",
    peg$c52 = peg$literalExpectation("\t", false),
    peg$c53 = "\x0B",
    peg$c54 = peg$literalExpectation("\x0B", false),
    peg$c55 = "\f",
    peg$c56 = peg$literalExpectation("\f", false),
    peg$c57 = " ",
    peg$c58 = peg$literalExpectation(" ", false),
    peg$c59 = "\xA0",
    peg$c60 = peg$literalExpectation("\xA0", false),
    peg$c61 = "\uFEFF",
    peg$c62 = peg$literalExpectation("\uFEFF", false),
    peg$c63 = peg$otherExpectation("end of line"),
    peg$c64 = "\n",
    peg$c65 = peg$literalExpectation("\n", false),
    peg$c66 = "\r\n",
    peg$c67 = peg$literalExpectation("\r\n", false),
    peg$c68 = "\r",
    peg$c69 = peg$literalExpectation("\r", false),
    peg$c70 = "\u2028",
    peg$c71 = peg$literalExpectation("\u2028", false),
    peg$c72 = "\u2029",
    peg$c73 = peg$literalExpectation("\u2029", false),
    peg$c74 = peg$otherExpectation("comment"),
    peg$c75 = "/*",
    peg$c76 = peg$literalExpectation("/*", false),
    peg$c77 = "*/",
    peg$c78 = peg$literalExpectation("*/", false),
    peg$c79 = "//",
    peg$c80 = peg$literalExpectation("//", false),
    peg$c81 = peg$otherExpectation("identifier"),
    peg$c82 = function (head, tail) {
      {
        return head + tail.join(``);
      }
    },
    peg$c83 = "_",
    peg$c84 = peg$literalExpectation("_", false),
    peg$c85 = "\\",
    peg$c86 = peg$literalExpectation("\\", false),
    peg$c87 = "\u200C",
    peg$c88 = peg$literalExpectation("\u200C", false),
    peg$c89 = "\u200D",
    peg$c90 = peg$literalExpectation("\u200D", false),
    peg$c91 = "@if(",
    peg$c92 = peg$literalExpectation("@if(", false),
    peg$c93 = function (conditions) {
      {
        return {
          name: `if`,
          parameters: { conditions },
        };
      }
    },
    peg$c94 = "@separator(",
    peg$c95 = peg$literalExpectation("@separator(", false),
    peg$c96 = "expr:",
    peg$c97 = peg$literalExpectation("expr:", false),
    peg$c98 = function (expr) {
      {
        return {
          name: `separator`,
          parameters: { expr },
        };
      }
    },
    peg$c99 = "@type(",
    peg$c100 = peg$literalExpectation("@type(", false),
    peg$c101 = "type:",
    peg$c102 = peg$literalExpectation("type:", false),
    peg$c103 = function (type) {
      {
        return {
          name: `type`,
          parameters: { type },
        };
      }
    },
    peg$c104 = "@token(",
    peg$c105 = peg$literalExpectation("@token(", false),
    peg$c106 = function (parameters) {
      {
        return {
          name: `token`,
          parameters: parameters ?? {},
        };
      }
    },
    peg$c107 = ",",
    peg$c108 = peg$literalExpectation(",", false),
    peg$c109 = function (parameterList) {
      return Object.fromEntries(parameterList);
    },
    peg$c110 = function (name, value) {
      return tuple([name, value]);
    },
    peg$c111 = "i",
    peg$c112 = peg$literalExpectation("i", false),
    peg$c113 = function (value, ignoreCase) {
      {
        return {
          type: `literal`,
          location: location(),
          ignoreCase: ignoreCase !== null,
          value,
        };
      }
    },
    peg$c114 = function () {
      {
        return JSON.parse(text());
      }
    },
    peg$c115 = function () {
      {
        return null;
      }
    },
    peg$c116 = peg$otherExpectation("array"),
    peg$c117 = "[",
    peg$c118 = peg$literalExpectation("[", false),
    peg$c119 = "]",
    peg$c120 = peg$literalExpectation("]", false),
    peg$c121 = function (values) {
      {
        return values ?? [];
      }
    },
    peg$c122 = peg$otherExpectation("string"),
    peg$c123 = "`",
    peg$c124 = peg$literalExpectation("`", false),
    peg$c125 = function (chars) {
      {
        return chars.join(``);
      }
    },
    peg$c126 = '"',
    peg$c127 = peg$literalExpectation('"', false),
    peg$c128 = "'",
    peg$c129 = peg$literalExpectation("'", false),
    peg$c130 = function () {
      {
        return text();
      }
    },
    peg$c131 = function (sequence) {
      {
        return sequence;
      }
    },
    peg$c132 = peg$otherExpectation("s(v)b"),
    peg$c133 = peg$otherExpectation("regexp"),
    peg$c134 = function (inverted, parts, ignoreCase) {
      {
        return {
          type: `class`,
          location: location(),
          parts: parts.filter((part) => part !== ``),
          inverted: inverted !== null,
          ignoreCase: ignoreCase !== null,
        };
      }
    },
    peg$c135 = "-",
    peg$c136 = peg$literalExpectation("-", false),
    peg$c137 = function (begin, end) {
      if (begin.charCodeAt(0) > end.charCodeAt(0))
        error(`Invalid character range: ${text()}.`);

      return tuple([begin, end]);
    },
    peg$c138 = function () {
      {
        return ``;
      }
    },
    peg$c139 = "0",
    peg$c140 = peg$literalExpectation("0", false),
    peg$c141 = function () {
      {
        return `\0`;
      }
    },
    peg$c142 = /^["'`\\]/,
    peg$c143 = peg$classExpectation(['"', "'", "`", "\\"], false, false),
    peg$c144 = "b",
    peg$c145 = peg$literalExpectation("b", false),
    peg$c146 = function () {
      {
        return `\b`;
      }
    },
    peg$c147 = "f",
    peg$c148 = peg$literalExpectation("f", false),
    peg$c149 = function () {
      {
        return `\f`;
      }
    },
    peg$c150 = "n",
    peg$c151 = peg$literalExpectation("n", false),
    peg$c152 = function () {
      {
        return `\n`;
      }
    },
    peg$c153 = "r",
    peg$c154 = peg$literalExpectation("r", false),
    peg$c155 = function () {
      {
        return `\r`;
      }
    },
    peg$c156 = "t",
    peg$c157 = peg$literalExpectation("t", false),
    peg$c158 = function () {
      {
        return `\t`;
      }
    },
    peg$c159 = "v",
    peg$c160 = peg$literalExpectation("v", false),
    peg$c161 = function () {
      {
        return `\v`;
      }
    },
    peg$c162 = "x",
    peg$c163 = peg$literalExpectation("x", false),
    peg$c164 = "u",
    peg$c165 = peg$literalExpectation("u", false),
    peg$c166 = function (digits) {
      return String.fromCharCode(parseInt(digits, 16));
    },
    peg$c167 = /^[0-9]/,
    peg$c168 = peg$classExpectation([["0", "9"]], false, false),
    peg$c169 = /^[0-9a-f]/i,
    peg$c170 = peg$classExpectation(
      [
        ["0", "9"],
        ["a", "f"],
      ],
      false,
      true,
    ),
    peg$c171 = ".",
    peg$c172 = peg$literalExpectation(".", false),
    peg$c173 = function () {
      {
        return {
          type: `any`,
          location: location(),
        };
      }
    },
    peg$c174 = function () {
      {
        return {
          type: `end`,
          location: location(),
        };
      }
    },
    peg$c175 = "{",
    peg$c176 = peg$literalExpectation("{", false),
    peg$c177 = "}",
    peg$c178 = peg$literalExpectation("}", false),
    peg$c179 = function (code) {
      {
        return code;
      }
    },
    peg$c180 = "=>",
    peg$c181 = peg$literalExpectation("=>", false),
    peg$c182 = function (code) {
      {
        return `{ return (${code}) }`;
      }
    },
    peg$c183 = /^[{}]/,
    peg$c184 = peg$classExpectation(["{", "}"], false, false),
    peg$c185 = /^[()]/,
    peg$c186 = peg$classExpectation(["(", ")"], false, false),
    peg$c187 =
      /^[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]/,
    peg$c188 = peg$classExpectation(
      [
        ["a", "z"],
        "µ",
        ["ß", "ö"],
        ["ø", "ÿ"],
        "ā",
        "ă",
        "ą",
        "ć",
        "ĉ",
        "ċ",
        "č",
        "ď",
        "đ",
        "ē",
        "ĕ",
        "ė",
        "ę",
        "ě",
        "ĝ",
        "ğ",
        "ġ",
        "ģ",
        "ĥ",
        "ħ",
        "ĩ",
        "ī",
        "ĭ",
        "į",
        "ı",
        "ĳ",
        "ĵ",
        ["ķ", "ĸ"],
        "ĺ",
        "ļ",
        "ľ",
        "ŀ",
        "ł",
        "ń",
        "ņ",
        ["ň", "ŉ"],
        "ŋ",
        "ō",
        "ŏ",
        "ő",
        "œ",
        "ŕ",
        "ŗ",
        "ř",
        "ś",
        "ŝ",
        "ş",
        "š",
        "ţ",
        "ť",
        "ŧ",
        "ũ",
        "ū",
        "ŭ",
        "ů",
        "ű",
        "ų",
        "ŵ",
        "ŷ",
        "ź",
        "ż",
        ["ž", "ƀ"],
        "ƃ",
        "ƅ",
        "ƈ",
        ["ƌ", "ƍ"],
        "ƒ",
        "ƕ",
        ["ƙ", "ƛ"],
        "ƞ",
        "ơ",
        "ƣ",
        "ƥ",
        "ƨ",
        ["ƪ", "ƫ"],
        "ƭ",
        "ư",
        "ƴ",
        "ƶ",
        ["ƹ", "ƺ"],
        ["ƽ", "ƿ"],
        "ǆ",
        "ǉ",
        "ǌ",
        "ǎ",
        "ǐ",
        "ǒ",
        "ǔ",
        "ǖ",
        "ǘ",
        "ǚ",
        ["ǜ", "ǝ"],
        "ǟ",
        "ǡ",
        "ǣ",
        "ǥ",
        "ǧ",
        "ǩ",
        "ǫ",
        "ǭ",
        ["ǯ", "ǰ"],
        "ǳ",
        "ǵ",
        "ǹ",
        "ǻ",
        "ǽ",
        "ǿ",
        "ȁ",
        "ȃ",
        "ȅ",
        "ȇ",
        "ȉ",
        "ȋ",
        "ȍ",
        "ȏ",
        "ȑ",
        "ȓ",
        "ȕ",
        "ȗ",
        "ș",
        "ț",
        "ȝ",
        "ȟ",
        "ȡ",
        "ȣ",
        "ȥ",
        "ȧ",
        "ȩ",
        "ȫ",
        "ȭ",
        "ȯ",
        "ȱ",
        ["ȳ", "ȹ"],
        "ȼ",
        ["ȿ", "ɀ"],
        "ɂ",
        "ɇ",
        "ɉ",
        "ɋ",
        "ɍ",
        ["ɏ", "ʓ"],
        ["ʕ", "ʯ"],
        "ͱ",
        "ͳ",
        "ͷ",
        ["ͻ", "ͽ"],
        "ΐ",
        ["ά", "ώ"],
        ["ϐ", "ϑ"],
        ["ϕ", "ϗ"],
        "ϙ",
        "ϛ",
        "ϝ",
        "ϟ",
        "ϡ",
        "ϣ",
        "ϥ",
        "ϧ",
        "ϩ",
        "ϫ",
        "ϭ",
        ["ϯ", "ϳ"],
        "ϵ",
        "ϸ",
        ["ϻ", "ϼ"],
        ["а", "џ"],
        "ѡ",
        "ѣ",
        "ѥ",
        "ѧ",
        "ѩ",
        "ѫ",
        "ѭ",
        "ѯ",
        "ѱ",
        "ѳ",
        "ѵ",
        "ѷ",
        "ѹ",
        "ѻ",
        "ѽ",
        "ѿ",
        "ҁ",
        "ҋ",
        "ҍ",
        "ҏ",
        "ґ",
        "ғ",
        "ҕ",
        "җ",
        "ҙ",
        "қ",
        "ҝ",
        "ҟ",
        "ҡ",
        "ң",
        "ҥ",
        "ҧ",
        "ҩ",
        "ҫ",
        "ҭ",
        "ү",
        "ұ",
        "ҳ",
        "ҵ",
        "ҷ",
        "ҹ",
        "һ",
        "ҽ",
        "ҿ",
        "ӂ",
        "ӄ",
        "ӆ",
        "ӈ",
        "ӊ",
        "ӌ",
        ["ӎ", "ӏ"],
        "ӑ",
        "ӓ",
        "ӕ",
        "ӗ",
        "ә",
        "ӛ",
        "ӝ",
        "ӟ",
        "ӡ",
        "ӣ",
        "ӥ",
        "ӧ",
        "ө",
        "ӫ",
        "ӭ",
        "ӯ",
        "ӱ",
        "ӳ",
        "ӵ",
        "ӷ",
        "ӹ",
        "ӻ",
        "ӽ",
        "ӿ",
        "ԁ",
        "ԃ",
        "ԅ",
        "ԇ",
        "ԉ",
        "ԋ",
        "ԍ",
        "ԏ",
        "ԑ",
        "ԓ",
        "ԕ",
        "ԗ",
        "ԙ",
        "ԛ",
        "ԝ",
        "ԟ",
        "ԡ",
        "ԣ",
        "ԥ",
        "ԧ",
        "ԩ",
        "ԫ",
        "ԭ",
        "ԯ",
        ["ա", "և"],
        ["ᏸ", "ᏽ"],
        ["ᴀ", "ᴫ"],
        ["ᵫ", "ᵷ"],
        ["ᵹ", "ᶚ"],
        "ḁ",
        "ḃ",
        "ḅ",
        "ḇ",
        "ḉ",
        "ḋ",
        "ḍ",
        "ḏ",
        "ḑ",
        "ḓ",
        "ḕ",
        "ḗ",
        "ḙ",
        "ḛ",
        "ḝ",
        "ḟ",
        "ḡ",
        "ḣ",
        "ḥ",
        "ḧ",
        "ḩ",
        "ḫ",
        "ḭ",
        "ḯ",
        "ḱ",
        "ḳ",
        "ḵ",
        "ḷ",
        "ḹ",
        "ḻ",
        "ḽ",
        "ḿ",
        "ṁ",
        "ṃ",
        "ṅ",
        "ṇ",
        "ṉ",
        "ṋ",
        "ṍ",
        "ṏ",
        "ṑ",
        "ṓ",
        "ṕ",
        "ṗ",
        "ṙ",
        "ṛ",
        "ṝ",
        "ṟ",
        "ṡ",
        "ṣ",
        "ṥ",
        "ṧ",
        "ṩ",
        "ṫ",
        "ṭ",
        "ṯ",
        "ṱ",
        "ṳ",
        "ṵ",
        "ṷ",
        "ṹ",
        "ṻ",
        "ṽ",
        "ṿ",
        "ẁ",
        "ẃ",
        "ẅ",
        "ẇ",
        "ẉ",
        "ẋ",
        "ẍ",
        "ẏ",
        "ẑ",
        "ẓ",
        ["ẕ", "ẝ"],
        "ẟ",
        "ạ",
        "ả",
        "ấ",
        "ầ",
        "ẩ",
        "ẫ",
        "ậ",
        "ắ",
        "ằ",
        "ẳ",
        "ẵ",
        "ặ",
        "ẹ",
        "ẻ",
        "ẽ",
        "ế",
        "ề",
        "ể",
        "ễ",
        "ệ",
        "ỉ",
        "ị",
        "ọ",
        "ỏ",
        "ố",
        "ồ",
        "ổ",
        "ỗ",
        "ộ",
        "ớ",
        "ờ",
        "ở",
        "ỡ",
        "ợ",
        "ụ",
        "ủ",
        "ứ",
        "ừ",
        "ử",
        "ữ",
        "ự",
        "ỳ",
        "ỵ",
        "ỷ",
        "ỹ",
        "ỻ",
        "ỽ",
        ["ỿ", "ἇ"],
        ["ἐ", "ἕ"],
        ["ἠ", "ἧ"],
        ["ἰ", "ἷ"],
        ["ὀ", "ὅ"],
        ["ὐ", "ὗ"],
        ["ὠ", "ὧ"],
        ["ὰ", "ώ"],
        ["ᾀ", "ᾇ"],
        ["ᾐ", "ᾗ"],
        ["ᾠ", "ᾧ"],
        ["ᾰ", "ᾴ"],
        ["ᾶ", "ᾷ"],
        "ι",
        ["ῂ", "ῄ"],
        ["ῆ", "ῇ"],
        ["ῐ", "ΐ"],
        ["ῖ", "ῗ"],
        ["ῠ", "ῧ"],
        ["ῲ", "ῴ"],
        ["ῶ", "ῷ"],
        "ℊ",
        ["ℎ", "ℏ"],
        "ℓ",
        "ℯ",
        "ℴ",
        "ℹ",
        ["ℼ", "ℽ"],
        ["ⅆ", "ⅉ"],
        "ⅎ",
        "ↄ",
        ["ⰰ", "ⱞ"],
        "ⱡ",
        ["ⱥ", "ⱦ"],
        "ⱨ",
        "ⱪ",
        "ⱬ",
        "ⱱ",
        ["ⱳ", "ⱴ"],
        ["ⱶ", "ⱻ"],
        "ⲁ",
        "ⲃ",
        "ⲅ",
        "ⲇ",
        "ⲉ",
        "ⲋ",
        "ⲍ",
        "ⲏ",
        "ⲑ",
        "ⲓ",
        "ⲕ",
        "ⲗ",
        "ⲙ",
        "ⲛ",
        "ⲝ",
        "ⲟ",
        "ⲡ",
        "ⲣ",
        "ⲥ",
        "ⲧ",
        "ⲩ",
        "ⲫ",
        "ⲭ",
        "ⲯ",
        "ⲱ",
        "ⲳ",
        "ⲵ",
        "ⲷ",
        "ⲹ",
        "ⲻ",
        "ⲽ",
        "ⲿ",
        "ⳁ",
        "ⳃ",
        "ⳅ",
        "ⳇ",
        "ⳉ",
        "ⳋ",
        "ⳍ",
        "ⳏ",
        "ⳑ",
        "ⳓ",
        "ⳕ",
        "ⳗ",
        "ⳙ",
        "ⳛ",
        "ⳝ",
        "ⳟ",
        "ⳡ",
        ["ⳣ", "ⳤ"],
        "ⳬ",
        "ⳮ",
        "ⳳ",
        ["ⴀ", "ⴥ"],
        "ⴧ",
        "ⴭ",
        "ꙁ",
        "ꙃ",
        "ꙅ",
        "ꙇ",
        "ꙉ",
        "ꙋ",
        "ꙍ",
        "ꙏ",
        "ꙑ",
        "ꙓ",
        "ꙕ",
        "ꙗ",
        "ꙙ",
        "ꙛ",
        "ꙝ",
        "ꙟ",
        "ꙡ",
        "ꙣ",
        "ꙥ",
        "ꙧ",
        "ꙩ",
        "ꙫ",
        "ꙭ",
        "ꚁ",
        "ꚃ",
        "ꚅ",
        "ꚇ",
        "ꚉ",
        "ꚋ",
        "ꚍ",
        "ꚏ",
        "ꚑ",
        "ꚓ",
        "ꚕ",
        "ꚗ",
        "ꚙ",
        "ꚛ",
        "ꜣ",
        "ꜥ",
        "ꜧ",
        "ꜩ",
        "ꜫ",
        "ꜭ",
        ["ꜯ", "ꜱ"],
        "ꜳ",
        "ꜵ",
        "ꜷ",
        "ꜹ",
        "ꜻ",
        "ꜽ",
        "ꜿ",
        "ꝁ",
        "ꝃ",
        "ꝅ",
        "ꝇ",
        "ꝉ",
        "ꝋ",
        "ꝍ",
        "ꝏ",
        "ꝑ",
        "ꝓ",
        "ꝕ",
        "ꝗ",
        "ꝙ",
        "ꝛ",
        "ꝝ",
        "ꝟ",
        "ꝡ",
        "ꝣ",
        "ꝥ",
        "ꝧ",
        "ꝩ",
        "ꝫ",
        "ꝭ",
        "ꝯ",
        ["ꝱ", "ꝸ"],
        "ꝺ",
        "ꝼ",
        "ꝿ",
        "ꞁ",
        "ꞃ",
        "ꞅ",
        "ꞇ",
        "ꞌ",
        "ꞎ",
        "ꞑ",
        ["ꞓ", "ꞕ"],
        "ꞗ",
        "ꞙ",
        "ꞛ",
        "ꞝ",
        "ꞟ",
        "ꞡ",
        "ꞣ",
        "ꞥ",
        "ꞧ",
        "ꞩ",
        "ꞵ",
        "ꞷ",
        "ꟺ",
        ["ꬰ", "ꭚ"],
        ["ꭠ", "ꭥ"],
        ["ꭰ", "ꮿ"],
        ["ﬀ", "ﬆ"],
        ["ﬓ", "ﬗ"],
        ["ａ", "ｚ"],
      ],
      false,
      false,
    ),
    peg$c189 =
      /^[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C-\uA69D\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3-\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E-\uFF9F]/,
    peg$c190 = peg$classExpectation(
      [
        ["ʰ", "ˁ"],
        ["ˆ", "ˑ"],
        ["ˠ", "ˤ"],
        "ˬ",
        "ˮ",
        "ʹ",
        "ͺ",
        "ՙ",
        "ـ",
        ["ۥ", "ۦ"],
        ["ߴ", "ߵ"],
        "ߺ",
        "ࠚ",
        "ࠤ",
        "ࠨ",
        "ॱ",
        "ๆ",
        "ໆ",
        "ჼ",
        "ៗ",
        "ᡃ",
        "ᪧ",
        ["ᱸ", "ᱽ"],
        ["ᴬ", "ᵪ"],
        "ᵸ",
        ["ᶛ", "ᶿ"],
        "ⁱ",
        "ⁿ",
        ["ₐ", "ₜ"],
        ["ⱼ", "ⱽ"],
        "ⵯ",
        "ⸯ",
        "々",
        ["〱", "〵"],
        "〻",
        ["ゝ", "ゞ"],
        ["ー", "ヾ"],
        "ꀕ",
        ["ꓸ", "ꓽ"],
        "ꘌ",
        "ꙿ",
        ["ꚜ", "ꚝ"],
        ["ꜗ", "ꜟ"],
        "ꝰ",
        "ꞈ",
        ["ꟸ", "ꟹ"],
        "ꧏ",
        "ꧦ",
        "ꩰ",
        "ꫝ",
        ["ꫳ", "ꫴ"],
        ["ꭜ", "ꭟ"],
        "ｰ",
        ["ﾞ", "ﾟ"],
      ],
      false,
      false,
    ),
    peg$c191 =
      /^[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
    peg$c192 = peg$classExpectation(
      [
        "ª",
        "º",
        "ƻ",
        ["ǀ", "ǃ"],
        "ʔ",
        ["א", "ת"],
        ["װ", "ײ"],
        ["ؠ", "ؿ"],
        ["ف", "ي"],
        ["ٮ", "ٯ"],
        ["ٱ", "ۓ"],
        "ە",
        ["ۮ", "ۯ"],
        ["ۺ", "ۼ"],
        "ۿ",
        "ܐ",
        ["ܒ", "ܯ"],
        ["ݍ", "ޥ"],
        "ޱ",
        ["ߊ", "ߪ"],
        ["ࠀ", "ࠕ"],
        ["ࡀ", "ࡘ"],
        ["ࢠ", "ࢴ"],
        ["ऄ", "ह"],
        "ऽ",
        "ॐ",
        ["क़", "ॡ"],
        ["ॲ", "ঀ"],
        ["অ", "ঌ"],
        ["এ", "ঐ"],
        ["ও", "ন"],
        ["প", "র"],
        "ল",
        ["শ", "হ"],
        "ঽ",
        "ৎ",
        ["ড়", "ঢ়"],
        ["য়", "ৡ"],
        ["ৰ", "ৱ"],
        ["ਅ", "ਊ"],
        ["ਏ", "ਐ"],
        ["ਓ", "ਨ"],
        ["ਪ", "ਰ"],
        ["ਲ", "ਲ਼"],
        ["ਵ", "ਸ਼"],
        ["ਸ", "ਹ"],
        ["ਖ਼", "ੜ"],
        "ਫ਼",
        ["ੲ", "ੴ"],
        ["અ", "ઍ"],
        ["એ", "ઑ"],
        ["ઓ", "ન"],
        ["પ", "ર"],
        ["લ", "ળ"],
        ["વ", "હ"],
        "ઽ",
        "ૐ",
        ["ૠ", "ૡ"],
        "ૹ",
        ["ଅ", "ଌ"],
        ["ଏ", "ଐ"],
        ["ଓ", "ନ"],
        ["ପ", "ର"],
        ["ଲ", "ଳ"],
        ["ଵ", "ହ"],
        "ଽ",
        ["ଡ଼", "ଢ଼"],
        ["ୟ", "ୡ"],
        "ୱ",
        "ஃ",
        ["அ", "ஊ"],
        ["எ", "ஐ"],
        ["ஒ", "க"],
        ["ங", "ச"],
        "ஜ",
        ["ஞ", "ட"],
        ["ண", "த"],
        ["ந", "ப"],
        ["ம", "ஹ"],
        "ௐ",
        ["అ", "ఌ"],
        ["ఎ", "ఐ"],
        ["ఒ", "న"],
        ["ప", "హ"],
        "ఽ",
        ["ౘ", "ౚ"],
        ["ౠ", "ౡ"],
        ["ಅ", "ಌ"],
        ["ಎ", "ಐ"],
        ["ಒ", "ನ"],
        ["ಪ", "ಳ"],
        ["ವ", "ಹ"],
        "ಽ",
        "ೞ",
        ["ೠ", "ೡ"],
        ["ೱ", "ೲ"],
        ["അ", "ഌ"],
        ["എ", "ഐ"],
        ["ഒ", "ഺ"],
        "ഽ",
        "ൎ",
        ["ൟ", "ൡ"],
        ["ൺ", "ൿ"],
        ["අ", "ඖ"],
        ["ක", "න"],
        ["ඳ", "ර"],
        "ල",
        ["ව", "ෆ"],
        ["ก", "ะ"],
        ["า", "ำ"],
        ["เ", "ๅ"],
        ["ກ", "ຂ"],
        "ຄ",
        ["ງ", "ຈ"],
        "ຊ",
        "ຍ",
        ["ດ", "ທ"],
        ["ນ", "ຟ"],
        ["ມ", "ຣ"],
        "ລ",
        "ວ",
        ["ສ", "ຫ"],
        ["ອ", "ະ"],
        ["າ", "ຳ"],
        "ຽ",
        ["ເ", "ໄ"],
        ["ໜ", "ໟ"],
        "ༀ",
        ["ཀ", "ཇ"],
        ["ཉ", "ཬ"],
        ["ྈ", "ྌ"],
        ["က", "ဪ"],
        "ဿ",
        ["ၐ", "ၕ"],
        ["ၚ", "ၝ"],
        "ၡ",
        ["ၥ", "ၦ"],
        ["ၮ", "ၰ"],
        ["ၵ", "ႁ"],
        "ႎ",
        ["ა", "ჺ"],
        ["ჽ", "ቈ"],
        ["ቊ", "ቍ"],
        ["ቐ", "ቖ"],
        "ቘ",
        ["ቚ", "ቝ"],
        ["በ", "ኈ"],
        ["ኊ", "ኍ"],
        ["ነ", "ኰ"],
        ["ኲ", "ኵ"],
        ["ኸ", "ኾ"],
        "ዀ",
        ["ዂ", "ዅ"],
        ["ወ", "ዖ"],
        ["ዘ", "ጐ"],
        ["ጒ", "ጕ"],
        ["ጘ", "ፚ"],
        ["ᎀ", "ᎏ"],
        ["ᐁ", "ᙬ"],
        ["ᙯ", "ᙿ"],
        ["ᚁ", "ᚚ"],
        ["ᚠ", "ᛪ"],
        ["ᛱ", "ᛸ"],
        ["ᜀ", "ᜌ"],
        ["ᜎ", "ᜑ"],
        ["ᜠ", "ᜱ"],
        ["ᝀ", "ᝑ"],
        ["ᝠ", "ᝬ"],
        ["ᝮ", "ᝰ"],
        ["ក", "ឳ"],
        "ៜ",
        ["ᠠ", "ᡂ"],
        ["ᡄ", "ᡷ"],
        ["ᢀ", "ᢨ"],
        "ᢪ",
        ["ᢰ", "ᣵ"],
        ["ᤀ", "ᤞ"],
        ["ᥐ", "ᥭ"],
        ["ᥰ", "ᥴ"],
        ["ᦀ", "ᦫ"],
        ["ᦰ", "ᧉ"],
        ["ᨀ", "ᨖ"],
        ["ᨠ", "ᩔ"],
        ["ᬅ", "ᬳ"],
        ["ᭅ", "ᭋ"],
        ["ᮃ", "ᮠ"],
        ["ᮮ", "ᮯ"],
        ["ᮺ", "ᯥ"],
        ["ᰀ", "ᰣ"],
        ["ᱍ", "ᱏ"],
        ["ᱚ", "ᱷ"],
        ["ᳩ", "ᳬ"],
        ["ᳮ", "ᳱ"],
        ["ᳵ", "ᳶ"],
        ["ℵ", "ℸ"],
        ["ⴰ", "ⵧ"],
        ["ⶀ", "ⶖ"],
        ["ⶠ", "ⶦ"],
        ["ⶨ", "ⶮ"],
        ["ⶰ", "ⶶ"],
        ["ⶸ", "ⶾ"],
        ["ⷀ", "ⷆ"],
        ["ⷈ", "ⷎ"],
        ["ⷐ", "ⷖ"],
        ["ⷘ", "ⷞ"],
        "〆",
        "〼",
        ["ぁ", "ゖ"],
        "ゟ",
        ["ァ", "ヺ"],
        "ヿ",
        ["ㄅ", "ㄭ"],
        ["ㄱ", "ㆎ"],
        ["ㆠ", "ㆺ"],
        ["ㇰ", "ㇿ"],
        ["㐀", "䶵"],
        ["一", "鿕"],
        ["ꀀ", "ꀔ"],
        ["ꀖ", "ꒌ"],
        ["ꓐ", "ꓷ"],
        ["ꔀ", "ꘋ"],
        ["ꘐ", "ꘟ"],
        ["ꘪ", "ꘫ"],
        "ꙮ",
        ["ꚠ", "ꛥ"],
        "ꞏ",
        "ꟷ",
        ["ꟻ", "ꠁ"],
        ["ꠃ", "ꠅ"],
        ["ꠇ", "ꠊ"],
        ["ꠌ", "ꠢ"],
        ["ꡀ", "ꡳ"],
        ["ꢂ", "ꢳ"],
        ["ꣲ", "ꣷ"],
        "ꣻ",
        "ꣽ",
        ["ꤊ", "ꤥ"],
        ["ꤰ", "ꥆ"],
        ["ꥠ", "ꥼ"],
        ["ꦄ", "ꦲ"],
        ["ꧠ", "ꧤ"],
        ["ꧧ", "ꧯ"],
        ["ꧺ", "ꧾ"],
        ["ꨀ", "ꨨ"],
        ["ꩀ", "ꩂ"],
        ["ꩄ", "ꩋ"],
        ["ꩠ", "ꩯ"],
        ["ꩱ", "ꩶ"],
        "ꩺ",
        ["ꩾ", "ꪯ"],
        "ꪱ",
        ["ꪵ", "ꪶ"],
        ["ꪹ", "ꪽ"],
        "ꫀ",
        "ꫂ",
        ["ꫛ", "ꫜ"],
        ["ꫠ", "ꫪ"],
        "ꫲ",
        ["ꬁ", "ꬆ"],
        ["ꬉ", "ꬎ"],
        ["ꬑ", "ꬖ"],
        ["ꬠ", "ꬦ"],
        ["ꬨ", "ꬮ"],
        ["ꯀ", "ꯢ"],
        ["가", "힣"],
        ["ힰ", "ퟆ"],
        ["ퟋ", "ퟻ"],
        ["豈", "舘"],
        ["並", "龎"],
        "יִ",
        ["ײַ", "ﬨ"],
        ["שׁ", "זּ"],
        ["טּ", "לּ"],
        "מּ",
        ["נּ", "סּ"],
        ["ףּ", "פּ"],
        ["צּ", "ﮱ"],
        ["ﯓ", "ﴽ"],
        ["ﵐ", "ﶏ"],
        ["ﶒ", "ﷇ"],
        ["ﷰ", "ﷻ"],
        ["ﹰ", "ﹴ"],
        ["ﹶ", "ﻼ"],
        ["ｦ", "ｯ"],
        ["ｱ", "ﾝ"],
        ["ﾠ", "ﾾ"],
        ["ￂ", "ￇ"],
        ["ￊ", "ￏ"],
        ["ￒ", "ￗ"],
        ["ￚ", "ￜ"],
      ],
      false,
      false,
    ),
    peg$c193 =
      /^[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]/,
    peg$c194 = peg$classExpectation(
      ["ǅ", "ǈ", "ǋ", "ǲ", ["ᾈ", "ᾏ"], ["ᾘ", "ᾟ"], ["ᾨ", "ᾯ"], "ᾼ", "ῌ", "ῼ"],
      false,
      false,
    ),
    peg$c195 =
      /^[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A]/,
    peg$c196 = peg$classExpectation(
      [
        ["A", "Z"],
        ["À", "Ö"],
        ["Ø", "Þ"],
        "Ā",
        "Ă",
        "Ą",
        "Ć",
        "Ĉ",
        "Ċ",
        "Č",
        "Ď",
        "Đ",
        "Ē",
        "Ĕ",
        "Ė",
        "Ę",
        "Ě",
        "Ĝ",
        "Ğ",
        "Ġ",
        "Ģ",
        "Ĥ",
        "Ħ",
        "Ĩ",
        "Ī",
        "Ĭ",
        "Į",
        "İ",
        "Ĳ",
        "Ĵ",
        "Ķ",
        "Ĺ",
        "Ļ",
        "Ľ",
        "Ŀ",
        "Ł",
        "Ń",
        "Ņ",
        "Ň",
        "Ŋ",
        "Ō",
        "Ŏ",
        "Ő",
        "Œ",
        "Ŕ",
        "Ŗ",
        "Ř",
        "Ś",
        "Ŝ",
        "Ş",
        "Š",
        "Ţ",
        "Ť",
        "Ŧ",
        "Ũ",
        "Ū",
        "Ŭ",
        "Ů",
        "Ű",
        "Ų",
        "Ŵ",
        "Ŷ",
        ["Ÿ", "Ź"],
        "Ż",
        "Ž",
        ["Ɓ", "Ƃ"],
        "Ƅ",
        ["Ɔ", "Ƈ"],
        ["Ɖ", "Ƌ"],
        ["Ǝ", "Ƒ"],
        ["Ɠ", "Ɣ"],
        ["Ɩ", "Ƙ"],
        ["Ɯ", "Ɲ"],
        ["Ɵ", "Ơ"],
        "Ƣ",
        "Ƥ",
        ["Ʀ", "Ƨ"],
        "Ʃ",
        "Ƭ",
        ["Ʈ", "Ư"],
        ["Ʊ", "Ƴ"],
        "Ƶ",
        ["Ʒ", "Ƹ"],
        "Ƽ",
        "Ǆ",
        "Ǉ",
        "Ǌ",
        "Ǎ",
        "Ǐ",
        "Ǒ",
        "Ǔ",
        "Ǖ",
        "Ǘ",
        "Ǚ",
        "Ǜ",
        "Ǟ",
        "Ǡ",
        "Ǣ",
        "Ǥ",
        "Ǧ",
        "Ǩ",
        "Ǫ",
        "Ǭ",
        "Ǯ",
        "Ǳ",
        "Ǵ",
        ["Ƕ", "Ǹ"],
        "Ǻ",
        "Ǽ",
        "Ǿ",
        "Ȁ",
        "Ȃ",
        "Ȅ",
        "Ȇ",
        "Ȉ",
        "Ȋ",
        "Ȍ",
        "Ȏ",
        "Ȑ",
        "Ȓ",
        "Ȕ",
        "Ȗ",
        "Ș",
        "Ț",
        "Ȝ",
        "Ȟ",
        "Ƞ",
        "Ȣ",
        "Ȥ",
        "Ȧ",
        "Ȩ",
        "Ȫ",
        "Ȭ",
        "Ȯ",
        "Ȱ",
        "Ȳ",
        ["Ⱥ", "Ȼ"],
        ["Ƚ", "Ⱦ"],
        "Ɂ",
        ["Ƀ", "Ɇ"],
        "Ɉ",
        "Ɋ",
        "Ɍ",
        "Ɏ",
        "Ͱ",
        "Ͳ",
        "Ͷ",
        "Ϳ",
        "Ά",
        ["Έ", "Ί"],
        "Ό",
        ["Ύ", "Ώ"],
        ["Α", "Ρ"],
        ["Σ", "Ϋ"],
        "Ϗ",
        ["ϒ", "ϔ"],
        "Ϙ",
        "Ϛ",
        "Ϝ",
        "Ϟ",
        "Ϡ",
        "Ϣ",
        "Ϥ",
        "Ϧ",
        "Ϩ",
        "Ϫ",
        "Ϭ",
        "Ϯ",
        "ϴ",
        "Ϸ",
        ["Ϲ", "Ϻ"],
        ["Ͻ", "Я"],
        "Ѡ",
        "Ѣ",
        "Ѥ",
        "Ѧ",
        "Ѩ",
        "Ѫ",
        "Ѭ",
        "Ѯ",
        "Ѱ",
        "Ѳ",
        "Ѵ",
        "Ѷ",
        "Ѹ",
        "Ѻ",
        "Ѽ",
        "Ѿ",
        "Ҁ",
        "Ҋ",
        "Ҍ",
        "Ҏ",
        "Ґ",
        "Ғ",
        "Ҕ",
        "Җ",
        "Ҙ",
        "Қ",
        "Ҝ",
        "Ҟ",
        "Ҡ",
        "Ң",
        "Ҥ",
        "Ҧ",
        "Ҩ",
        "Ҫ",
        "Ҭ",
        "Ү",
        "Ұ",
        "Ҳ",
        "Ҵ",
        "Ҷ",
        "Ҹ",
        "Һ",
        "Ҽ",
        "Ҿ",
        ["Ӏ", "Ӂ"],
        "Ӄ",
        "Ӆ",
        "Ӈ",
        "Ӊ",
        "Ӌ",
        "Ӎ",
        "Ӑ",
        "Ӓ",
        "Ӕ",
        "Ӗ",
        "Ә",
        "Ӛ",
        "Ӝ",
        "Ӟ",
        "Ӡ",
        "Ӣ",
        "Ӥ",
        "Ӧ",
        "Ө",
        "Ӫ",
        "Ӭ",
        "Ӯ",
        "Ӱ",
        "Ӳ",
        "Ӵ",
        "Ӷ",
        "Ӹ",
        "Ӻ",
        "Ӽ",
        "Ӿ",
        "Ԁ",
        "Ԃ",
        "Ԅ",
        "Ԇ",
        "Ԉ",
        "Ԋ",
        "Ԍ",
        "Ԏ",
        "Ԑ",
        "Ԓ",
        "Ԕ",
        "Ԗ",
        "Ԙ",
        "Ԛ",
        "Ԝ",
        "Ԟ",
        "Ԡ",
        "Ԣ",
        "Ԥ",
        "Ԧ",
        "Ԩ",
        "Ԫ",
        "Ԭ",
        "Ԯ",
        ["Ա", "Ֆ"],
        ["Ⴀ", "Ⴥ"],
        "Ⴧ",
        "Ⴭ",
        ["Ꭰ", "Ᏽ"],
        "Ḁ",
        "Ḃ",
        "Ḅ",
        "Ḇ",
        "Ḉ",
        "Ḋ",
        "Ḍ",
        "Ḏ",
        "Ḑ",
        "Ḓ",
        "Ḕ",
        "Ḗ",
        "Ḙ",
        "Ḛ",
        "Ḝ",
        "Ḟ",
        "Ḡ",
        "Ḣ",
        "Ḥ",
        "Ḧ",
        "Ḩ",
        "Ḫ",
        "Ḭ",
        "Ḯ",
        "Ḱ",
        "Ḳ",
        "Ḵ",
        "Ḷ",
        "Ḹ",
        "Ḻ",
        "Ḽ",
        "Ḿ",
        "Ṁ",
        "Ṃ",
        "Ṅ",
        "Ṇ",
        "Ṉ",
        "Ṋ",
        "Ṍ",
        "Ṏ",
        "Ṑ",
        "Ṓ",
        "Ṕ",
        "Ṗ",
        "Ṙ",
        "Ṛ",
        "Ṝ",
        "Ṟ",
        "Ṡ",
        "Ṣ",
        "Ṥ",
        "Ṧ",
        "Ṩ",
        "Ṫ",
        "Ṭ",
        "Ṯ",
        "Ṱ",
        "Ṳ",
        "Ṵ",
        "Ṷ",
        "Ṹ",
        "Ṻ",
        "Ṽ",
        "Ṿ",
        "Ẁ",
        "Ẃ",
        "Ẅ",
        "Ẇ",
        "Ẉ",
        "Ẋ",
        "Ẍ",
        "Ẏ",
        "Ẑ",
        "Ẓ",
        "Ẕ",
        "ẞ",
        "Ạ",
        "Ả",
        "Ấ",
        "Ầ",
        "Ẩ",
        "Ẫ",
        "Ậ",
        "Ắ",
        "Ằ",
        "Ẳ",
        "Ẵ",
        "Ặ",
        "Ẹ",
        "Ẻ",
        "Ẽ",
        "Ế",
        "Ề",
        "Ể",
        "Ễ",
        "Ệ",
        "Ỉ",
        "Ị",
        "Ọ",
        "Ỏ",
        "Ố",
        "Ồ",
        "Ổ",
        "Ỗ",
        "Ộ",
        "Ớ",
        "Ờ",
        "Ở",
        "Ỡ",
        "Ợ",
        "Ụ",
        "Ủ",
        "Ứ",
        "Ừ",
        "Ử",
        "Ữ",
        "Ự",
        "Ỳ",
        "Ỵ",
        "Ỷ",
        "Ỹ",
        "Ỻ",
        "Ỽ",
        "Ỿ",
        ["Ἀ", "Ἇ"],
        ["Ἐ", "Ἕ"],
        ["Ἠ", "Ἧ"],
        ["Ἰ", "Ἷ"],
        ["Ὀ", "Ὅ"],
        "Ὑ",
        "Ὓ",
        "Ὕ",
        "Ὗ",
        ["Ὠ", "Ὧ"],
        ["Ᾰ", "Ά"],
        ["Ὲ", "Ή"],
        ["Ῐ", "Ί"],
        ["Ῠ", "Ῥ"],
        ["Ὸ", "Ώ"],
        "ℂ",
        "ℇ",
        ["ℋ", "ℍ"],
        ["ℐ", "ℒ"],
        "ℕ",
        ["ℙ", "ℝ"],
        "ℤ",
        "Ω",
        "ℨ",
        ["K", "ℭ"],
        ["ℰ", "ℳ"],
        ["ℾ", "ℿ"],
        "ⅅ",
        "Ↄ",
        ["Ⰰ", "Ⱞ"],
        "Ⱡ",
        ["Ɫ", "Ɽ"],
        "Ⱨ",
        "Ⱪ",
        "Ⱬ",
        ["Ɑ", "Ɒ"],
        "Ⱳ",
        "Ⱶ",
        ["Ȿ", "Ⲁ"],
        "Ⲃ",
        "Ⲅ",
        "Ⲇ",
        "Ⲉ",
        "Ⲋ",
        "Ⲍ",
        "Ⲏ",
        "Ⲑ",
        "Ⲓ",
        "Ⲕ",
        "Ⲗ",
        "Ⲙ",
        "Ⲛ",
        "Ⲝ",
        "Ⲟ",
        "Ⲡ",
        "Ⲣ",
        "Ⲥ",
        "Ⲧ",
        "Ⲩ",
        "Ⲫ",
        "Ⲭ",
        "Ⲯ",
        "Ⲱ",
        "Ⲳ",
        "Ⲵ",
        "Ⲷ",
        "Ⲹ",
        "Ⲻ",
        "Ⲽ",
        "Ⲿ",
        "Ⳁ",
        "Ⳃ",
        "Ⳅ",
        "Ⳇ",
        "Ⳉ",
        "Ⳋ",
        "Ⳍ",
        "Ⳏ",
        "Ⳑ",
        "Ⳓ",
        "Ⳕ",
        "Ⳗ",
        "Ⳙ",
        "Ⳛ",
        "Ⳝ",
        "Ⳟ",
        "Ⳡ",
        "Ⳣ",
        "Ⳬ",
        "Ⳮ",
        "Ⳳ",
        "Ꙁ",
        "Ꙃ",
        "Ꙅ",
        "Ꙇ",
        "Ꙉ",
        "Ꙋ",
        "Ꙍ",
        "Ꙏ",
        "Ꙑ",
        "Ꙓ",
        "Ꙕ",
        "Ꙗ",
        "Ꙙ",
        "Ꙛ",
        "Ꙝ",
        "Ꙟ",
        "Ꙡ",
        "Ꙣ",
        "Ꙥ",
        "Ꙧ",
        "Ꙩ",
        "Ꙫ",
        "Ꙭ",
        "Ꚁ",
        "Ꚃ",
        "Ꚅ",
        "Ꚇ",
        "Ꚉ",
        "Ꚋ",
        "Ꚍ",
        "Ꚏ",
        "Ꚑ",
        "Ꚓ",
        "Ꚕ",
        "Ꚗ",
        "Ꚙ",
        "Ꚛ",
        "Ꜣ",
        "Ꜥ",
        "Ꜧ",
        "Ꜩ",
        "Ꜫ",
        "Ꜭ",
        "Ꜯ",
        "Ꜳ",
        "Ꜵ",
        "Ꜷ",
        "Ꜹ",
        "Ꜻ",
        "Ꜽ",
        "Ꜿ",
        "Ꝁ",
        "Ꝃ",
        "Ꝅ",
        "Ꝇ",
        "Ꝉ",
        "Ꝋ",
        "Ꝍ",
        "Ꝏ",
        "Ꝑ",
        "Ꝓ",
        "Ꝕ",
        "Ꝗ",
        "Ꝙ",
        "Ꝛ",
        "Ꝝ",
        "Ꝟ",
        "Ꝡ",
        "Ꝣ",
        "Ꝥ",
        "Ꝧ",
        "Ꝩ",
        "Ꝫ",
        "Ꝭ",
        "Ꝯ",
        "Ꝺ",
        "Ꝼ",
        ["Ᵹ", "Ꝿ"],
        "Ꞁ",
        "Ꞃ",
        "Ꞅ",
        "Ꞇ",
        "Ꞌ",
        "Ɥ",
        "Ꞑ",
        "Ꞓ",
        "Ꞗ",
        "Ꞙ",
        "Ꞛ",
        "Ꞝ",
        "Ꞟ",
        "Ꞡ",
        "Ꞣ",
        "Ꞥ",
        "Ꞧ",
        "Ꞩ",
        ["Ɦ", "Ɬ"],
        ["Ʞ", "Ꞵ"],
        "Ꞷ",
        ["Ａ", "Ｚ"],
      ],
      false,
      false,
    ),
    peg$c197 =
      /^[\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC]/,
    peg$c198 = peg$classExpectation(
      [
        "ः",
        "ऻ",
        ["ा", "ी"],
        ["ॉ", "ौ"],
        ["ॎ", "ॏ"],
        ["ং", "ঃ"],
        ["া", "ী"],
        ["ে", "ৈ"],
        ["ো", "ৌ"],
        "ৗ",
        "ਃ",
        ["ਾ", "ੀ"],
        "ઃ",
        ["ા", "ી"],
        "ૉ",
        ["ો", "ૌ"],
        ["ଂ", "ଃ"],
        "ା",
        "ୀ",
        ["େ", "ୈ"],
        ["ୋ", "ୌ"],
        "ୗ",
        ["ா", "ி"],
        ["ு", "ூ"],
        ["ெ", "ை"],
        ["ொ", "ௌ"],
        "ௗ",
        ["ఁ", "ః"],
        ["ు", "ౄ"],
        ["ಂ", "ಃ"],
        "ಾ",
        ["ೀ", "ೄ"],
        ["ೇ", "ೈ"],
        ["ೊ", "ೋ"],
        ["ೕ", "ೖ"],
        ["ം", "ഃ"],
        ["ാ", "ീ"],
        ["െ", "ൈ"],
        ["ൊ", "ൌ"],
        "ൗ",
        ["ං", "ඃ"],
        ["ා", "ෑ"],
        ["ෘ", "ෟ"],
        ["ෲ", "ෳ"],
        ["༾", "༿"],
        "ཿ",
        ["ါ", "ာ"],
        "ေ",
        "း",
        ["ျ", "ြ"],
        ["ၖ", "ၗ"],
        ["ၢ", "ၤ"],
        ["ၧ", "ၭ"],
        ["ႃ", "ႄ"],
        ["ႇ", "ႌ"],
        "ႏ",
        ["ႚ", "ႜ"],
        "ា",
        ["ើ", "ៅ"],
        ["ះ", "ៈ"],
        ["ᤣ", "ᤦ"],
        ["ᤩ", "ᤫ"],
        ["ᤰ", "ᤱ"],
        ["ᤳ", "ᤸ"],
        ["ᨙ", "ᨚ"],
        "ᩕ",
        "ᩗ",
        "ᩡ",
        ["ᩣ", "ᩤ"],
        ["ᩭ", "ᩲ"],
        "ᬄ",
        "ᬵ",
        "ᬻ",
        ["ᬽ", "ᭁ"],
        ["ᭃ", "᭄"],
        "ᮂ",
        "ᮡ",
        ["ᮦ", "ᮧ"],
        "᮪",
        "ᯧ",
        ["ᯪ", "ᯬ"],
        "ᯮ",
        ["᯲", "᯳"],
        ["ᰤ", "ᰫ"],
        ["ᰴ", "ᰵ"],
        "᳡",
        ["ᳲ", "ᳳ"],
        ["〮", "〯"],
        ["ꠣ", "ꠤ"],
        "ꠧ",
        ["ꢀ", "ꢁ"],
        ["ꢴ", "ꣃ"],
        ["ꥒ", "꥓"],
        "ꦃ",
        ["ꦴ", "ꦵ"],
        ["ꦺ", "ꦻ"],
        ["ꦽ", "꧀"],
        ["ꨯ", "ꨰ"],
        ["ꨳ", "ꨴ"],
        "ꩍ",
        "ꩻ",
        "ꩽ",
        "ꫫ",
        ["ꫮ", "ꫯ"],
        "ꫵ",
        ["ꯣ", "ꯤ"],
        ["ꯦ", "ꯧ"],
        ["ꯩ", "ꯪ"],
        "꯬",
      ],
      false,
      false,
    ),
    peg$c199 =
      /^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/,
    peg$c200 = peg$classExpectation(
      [
        ["̀", "ͯ"],
        ["҃", "҇"],
        ["֑", "ֽ"],
        "ֿ",
        ["ׁ", "ׂ"],
        ["ׄ", "ׅ"],
        "ׇ",
        ["ؐ", "ؚ"],
        ["ً", "ٟ"],
        "ٰ",
        ["ۖ", "ۜ"],
        ["۟", "ۤ"],
        ["ۧ", "ۨ"],
        ["۪", "ۭ"],
        "ܑ",
        ["ܰ", "݊"],
        ["ަ", "ް"],
        ["߫", "߳"],
        ["ࠖ", "࠙"],
        ["ࠛ", "ࠣ"],
        ["ࠥ", "ࠧ"],
        ["ࠩ", "࠭"],
        ["࡙", "࡛"],
        ["ࣣ", "ं"],
        "ऺ",
        "़",
        ["ु", "ै"],
        "्",
        ["॑", "ॗ"],
        ["ॢ", "ॣ"],
        "ঁ",
        "়",
        ["ু", "ৄ"],
        "্",
        ["ৢ", "ৣ"],
        ["ਁ", "ਂ"],
        "਼",
        ["ੁ", "ੂ"],
        ["ੇ", "ੈ"],
        ["ੋ", "੍"],
        "ੑ",
        ["ੰ", "ੱ"],
        "ੵ",
        ["ઁ", "ં"],
        "઼",
        ["ુ", "ૅ"],
        ["ે", "ૈ"],
        "્",
        ["ૢ", "ૣ"],
        "ଁ",
        "଼",
        "ି",
        ["ୁ", "ୄ"],
        "୍",
        "ୖ",
        ["ୢ", "ୣ"],
        "ஂ",
        "ீ",
        "்",
        "ఀ",
        ["ా", "ీ"],
        ["ె", "ై"],
        ["ొ", "్"],
        ["ౕ", "ౖ"],
        ["ౢ", "ౣ"],
        "ಁ",
        "಼",
        "ಿ",
        "ೆ",
        ["ೌ", "್"],
        ["ೢ", "ೣ"],
        "ഁ",
        ["ു", "ൄ"],
        "്",
        ["ൢ", "ൣ"],
        "්",
        ["ි", "ු"],
        "ූ",
        "ั",
        ["ิ", "ฺ"],
        ["็", "๎"],
        "ັ",
        ["ິ", "ູ"],
        ["ົ", "ຼ"],
        ["່", "ໍ"],
        ["༘", "༙"],
        "༵",
        "༷",
        "༹",
        ["ཱ", "ཾ"],
        ["ྀ", "྄"],
        ["྆", "྇"],
        ["ྍ", "ྗ"],
        ["ྙ", "ྼ"],
        "࿆",
        ["ိ", "ူ"],
        ["ဲ", "့"],
        ["္", "်"],
        ["ွ", "ှ"],
        ["ၘ", "ၙ"],
        ["ၞ", "ၠ"],
        ["ၱ", "ၴ"],
        "ႂ",
        ["ႅ", "ႆ"],
        "ႍ",
        "ႝ",
        ["፝", "፟"],
        ["ᜒ", "᜔"],
        ["ᜲ", "᜴"],
        ["ᝒ", "ᝓ"],
        ["ᝲ", "ᝳ"],
        ["឴", "឵"],
        ["ិ", "ួ"],
        "ំ",
        ["៉", "៓"],
        "៝",
        ["᠋", "᠍"],
        "ᢩ",
        ["ᤠ", "ᤢ"],
        ["ᤧ", "ᤨ"],
        "ᤲ",
        ["᤹", "᤻"],
        ["ᨗ", "ᨘ"],
        "ᨛ",
        "ᩖ",
        ["ᩘ", "ᩞ"],
        "᩠",
        "ᩢ",
        ["ᩥ", "ᩬ"],
        ["ᩳ", "᩼"],
        "᩿",
        ["᪰", "᪽"],
        ["ᬀ", "ᬃ"],
        "᬴",
        ["ᬶ", "ᬺ"],
        "ᬼ",
        "ᭂ",
        ["᭫", "᭳"],
        ["ᮀ", "ᮁ"],
        ["ᮢ", "ᮥ"],
        ["ᮨ", "ᮩ"],
        ["᮫", "ᮭ"],
        "᯦",
        ["ᯨ", "ᯩ"],
        "ᯭ",
        ["ᯯ", "ᯱ"],
        ["ᰬ", "ᰳ"],
        ["ᰶ", "᰷"],
        ["᳐", "᳒"],
        ["᳔", "᳠"],
        ["᳢", "᳨"],
        "᳭",
        "᳴",
        ["᳸", "᳹"],
        ["᷀", "᷵"],
        ["᷼", "᷿"],
        ["⃐", "⃜"],
        "⃡",
        ["⃥", "⃰"],
        ["⳯", "⳱"],
        "⵿",
        ["ⷠ", "ⷿ"],
        ["〪", "〭"],
        ["゙", "゚"],
        "꙯",
        ["ꙴ", "꙽"],
        ["ꚞ", "ꚟ"],
        ["꛰", "꛱"],
        "ꠂ",
        "꠆",
        "ꠋ",
        ["ꠥ", "ꠦ"],
        "꣄",
        ["꣠", "꣱"],
        ["ꤦ", "꤭"],
        ["ꥇ", "ꥑ"],
        ["ꦀ", "ꦂ"],
        "꦳",
        ["ꦶ", "ꦹ"],
        "ꦼ",
        "ꧥ",
        ["ꨩ", "ꨮ"],
        ["ꨱ", "ꨲ"],
        ["ꨵ", "ꨶ"],
        "ꩃ",
        "ꩌ",
        "ꩼ",
        "ꪰ",
        ["ꪲ", "ꪴ"],
        ["ꪷ", "ꪸ"],
        ["ꪾ", "꪿"],
        "꫁",
        ["ꫬ", "ꫭ"],
        "꫶",
        "ꯥ",
        "ꯨ",
        "꯭",
        "ﬞ",
        ["︀", "️"],
        ["︠", "︯"],
      ],
      false,
      false,
    ),
    peg$c201 =
      /^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/,
    peg$c202 = peg$classExpectation(
      [
        ["0", "9"],
        ["٠", "٩"],
        ["۰", "۹"],
        ["߀", "߉"],
        ["०", "९"],
        ["০", "৯"],
        ["੦", "੯"],
        ["૦", "૯"],
        ["୦", "୯"],
        ["௦", "௯"],
        ["౦", "౯"],
        ["೦", "೯"],
        ["൦", "൯"],
        ["෦", "෯"],
        ["๐", "๙"],
        ["໐", "໙"],
        ["༠", "༩"],
        ["၀", "၉"],
        ["႐", "႙"],
        ["០", "៩"],
        ["᠐", "᠙"],
        ["᥆", "᥏"],
        ["᧐", "᧙"],
        ["᪀", "᪉"],
        ["᪐", "᪙"],
        ["᭐", "᭙"],
        ["᮰", "᮹"],
        ["᱀", "᱉"],
        ["᱐", "᱙"],
        ["꘠", "꘩"],
        ["꣐", "꣙"],
        ["꤀", "꤉"],
        ["꧐", "꧙"],
        ["꧰", "꧹"],
        ["꩐", "꩙"],
        ["꯰", "꯹"],
        ["０", "９"],
      ],
      false,
      false,
    ),
    peg$c203 =
      /^[\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]/,
    peg$c204 = peg$classExpectation(
      [
        ["ᛮ", "ᛰ"],
        ["Ⅰ", "ↂ"],
        ["ↅ", "ↈ"],
        "〇",
        ["〡", "〩"],
        ["〸", "〺"],
        ["ꛦ", "ꛯ"],
      ],
      false,
      false,
    ),
    peg$c205 = /^[_\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]/,
    peg$c206 = peg$classExpectation(
      ["_", ["‿", "⁀"], "⁔", ["︳", "︴"], ["﹍", "﹏"], "＿"],
      false,
      false,
    ),
    peg$c207 = /^[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
    peg$c208 = peg$classExpectation(
      [" ", " ", " ", [" ", " "], " ", " ", "　"],
      false,
      false,
    ),
    peg$c209 = "break",
    peg$c210 = peg$literalExpectation("break", false),
    peg$c211 = "case",
    peg$c212 = peg$literalExpectation("case", false),
    peg$c213 = "catch",
    peg$c214 = peg$literalExpectation("catch", false),
    peg$c215 = "class",
    peg$c216 = peg$literalExpectation("class", false),
    peg$c217 = "const",
    peg$c218 = peg$literalExpectation("const", false),
    peg$c219 = "continue",
    peg$c220 = peg$literalExpectation("continue", false),
    peg$c221 = "debugger",
    peg$c222 = peg$literalExpectation("debugger", false),
    peg$c223 = "default",
    peg$c224 = peg$literalExpectation("default", false),
    peg$c225 = "delete",
    peg$c226 = peg$literalExpectation("delete", false),
    peg$c227 = "do",
    peg$c228 = peg$literalExpectation("do", false),
    peg$c229 = "else",
    peg$c230 = peg$literalExpectation("else", false),
    peg$c231 = "enum",
    peg$c232 = peg$literalExpectation("enum", false),
    peg$c233 = "export",
    peg$c234 = peg$literalExpectation("export", false),
    peg$c235 = "extends",
    peg$c236 = peg$literalExpectation("extends", false),
    peg$c237 = "false",
    peg$c238 = peg$literalExpectation("false", false),
    peg$c239 = "finally",
    peg$c240 = peg$literalExpectation("finally", false),
    peg$c241 = "for",
    peg$c242 = peg$literalExpectation("for", false),
    peg$c243 = "function",
    peg$c244 = peg$literalExpectation("function", false),
    peg$c245 = "if",
    peg$c246 = peg$literalExpectation("if", false),
    peg$c247 = "import",
    peg$c248 = peg$literalExpectation("import", false),
    peg$c249 = "instanceof",
    peg$c250 = peg$literalExpectation("instanceof", false),
    peg$c251 = "in",
    peg$c252 = peg$literalExpectation("in", false),
    peg$c253 = "new",
    peg$c254 = peg$literalExpectation("new", false),
    peg$c255 = "null",
    peg$c256 = peg$literalExpectation("null", false),
    peg$c257 = "return",
    peg$c258 = peg$literalExpectation("return", false),
    peg$c259 = "super",
    peg$c260 = peg$literalExpectation("super", false),
    peg$c261 = "switch",
    peg$c262 = peg$literalExpectation("switch", false),
    peg$c263 = "this",
    peg$c264 = peg$literalExpectation("this", false),
    peg$c265 = "throw",
    peg$c266 = peg$literalExpectation("throw", false),
    peg$c267 = "true",
    peg$c268 = peg$literalExpectation("true", false),
    peg$c269 = "try",
    peg$c270 = peg$literalExpectation("try", false),
    peg$c271 = "typeof",
    peg$c272 = peg$literalExpectation("typeof", false),
    peg$c273 = "var",
    peg$c274 = peg$literalExpectation("var", false),
    peg$c275 = "void",
    peg$c276 = peg$literalExpectation("void", false),
    peg$c277 = "while",
    peg$c278 = peg$literalExpectation("while", false),
    peg$c279 = "with",
    peg$c280 = peg$literalExpectation("with", false),
    peg$c281 = ";",
    peg$c282 = peg$literalExpectation(";", false),
    peg$currPos = 0,
    peg$savedPos = 0,
    peg$posDetailsCache = [{ line: 1, column: 1 }],
    peg$maxFailPos = 0,
    peg$maxFailExpected = [],
    peg$scopes = [],
    peg$transactions = [],
    peg$currentTransaction = undefined,
    peg$silentFails = 0,
    peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(
        "Can't start parsing from rule \"" + options.startRule + '".',
      );
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  function tuple(arr) {
    return arr;
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function onRollback(fn) {
    peg$transactions[0]?.unshift(fn);
  }

  function expected(description, location) {
    location =
      location !== void 0
        ? location
        : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location,
    );
  }

  function error(message, location) {
    location =
      location !== void 0
        ? location
        : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return {
      type: "class",
      parts: parts,
      inverted: inverted,
      ignoreCase: ignoreCase,
    };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos],
      p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column,
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
      endPosDetails = peg$computePosDetails(endPos);

    return {
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column,
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column,
      },
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$inferToken(tokenStart) {
    if (tokenStart >= input.length) return null;

    var regex = /\W/g;
    regex.lastIndex = tokenStart;

    var match = regex.exec(input);
    var tokenEnd = match ? match.index : input.length;
    var suffix = tokenEnd - tokenStart > 20 ? "..." : "";

    tokenEnd = Math.min(tokenEnd, tokenStart + 20) - suffix.length;
    tokenEnd = Math.max(tokenStart + 1, tokenEnd);

    return input.slice(tokenStart, tokenEnd) + suffix;
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location,
    );
  }

  function peg$parseGrammar() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      peg$transactions.unshift([]);
      s2 = peg$currPos;
      s3 = peg$parseInitializer();
      if (s3 !== peg$FAILED) {
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          peg$savedPos = s2;
          s3 = peg$c0(s3);
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$currPos;
        s5 = peg$parseRule();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            peg$savedPos = s4;
            s5 = peg$c1(s2, s5);
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            peg$transactions.unshift([]);
            s4 = peg$currPos;
            s5 = peg$parseRule();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                peg$savedPos = s4;
                s5 = peg$c1(s2, s5);
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c2(s2, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseInitializer() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseCodeBlock();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseEOS();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c3(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseRule() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$transactions.unshift([]);
    s2 = peg$currPos;
    s3 = peg$parseAnnotation();
    if (s3 !== peg$FAILED) {
      s4 = [];
      peg$transactions.unshift([]);
      s5 = peg$currPos;
      s6 = peg$parse__();
      if (s6 !== peg$FAILED) {
        s7 = peg$parseAnnotation();
        if (s7 !== peg$FAILED) {
          peg$savedPos = s5;
          s6 = peg$c4(s3, s7);
          s5 = s6;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      if (s5 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        peg$transactions.unshift([]);
        s5 = peg$currPos;
        s6 = peg$parse__();
        if (s6 !== peg$FAILED) {
          s7 = peg$parseAnnotation();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s5;
            s6 = peg$c4(s3, s7);
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s4 !== peg$FAILED) {
        peg$savedPos = s2;
        s3 = peg$c5(s3, s4);
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    if (s2 !== peg$FAILED) {
      peg$savedPos = s1;
      s2 = peg$c6(s2);
    }
    s1 = s2;
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseIdentifierName();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            peg$transactions.unshift([]);
            s5 = peg$currPos;
            s6 = peg$parseStringLiteral();
            if (s6 !== peg$FAILED) {
              s7 = peg$parse__();
              if (s7 !== peg$FAILED) {
                peg$savedPos = s5;
                s6 = peg$c7(s1, s3, s6);
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s6 = peg$c8;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c9);
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse__();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseExpression();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseEOS();
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c10(s1, s3, s5, s8);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseExpression() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseLeadingChoiceExpression();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseLeadingChoiceExpression() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 47) {
      s1 = peg$c11;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c12);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseChoiceExpression();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c0(s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseChoiceExpression() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parseAnnotatedScopeExpression();
      if (s3 !== peg$FAILED) {
        s4 = [];
        peg$transactions.unshift([]);
        s5 = peg$currPos;
        s6 = peg$currPos;
        s7 = peg$parse__();
        if (s7 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 47) {
            s8 = peg$c11;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c12);
            }
          }
          if (s8 !== peg$FAILED) {
            s9 = peg$parse__();
            if (s9 !== peg$FAILED) {
              s7 = [s7, s8, s9];
              s6 = s7;
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parseAnnotatedScopeExpression();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s5;
            s6 = peg$c4(s3, s7);
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          peg$transactions.unshift([]);
          s5 = peg$currPos;
          s6 = peg$currPos;
          s7 = peg$parse__();
          if (s7 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 47) {
              s8 = peg$c11;
              peg$currPos++;
            } else {
              s8 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c12);
              }
            }
            if (s8 !== peg$FAILED) {
              s9 = peg$parse__();
              if (s9 !== peg$FAILED) {
                s7 = [s7, s8, s9];
                s6 = s7;
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$parseAnnotatedScopeExpression();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s5;
              s6 = peg$c4(s3, s7);
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          if (s5 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
        if (s4 !== peg$FAILED) {
          peg$savedPos = s2;
          s3 = peg$c5(s3, s4);
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c13(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseAnnotatedScopeExpression() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$transactions.unshift([]);
    s2 = peg$currPos;
    s3 = peg$parseAnnotation();
    if (s3 !== peg$FAILED) {
      s4 = [];
      peg$transactions.unshift([]);
      s5 = peg$currPos;
      s6 = peg$parse__();
      if (s6 !== peg$FAILED) {
        s7 = peg$parseAnnotation();
        if (s7 !== peg$FAILED) {
          peg$savedPos = s5;
          s6 = peg$c4(s3, s7);
          s5 = s6;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      if (s5 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        peg$transactions.unshift([]);
        s5 = peg$currPos;
        s6 = peg$parse__();
        if (s6 !== peg$FAILED) {
          s7 = peg$parseAnnotation();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s5;
            s6 = peg$c4(s3, s7);
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s4 !== peg$FAILED) {
        peg$savedPos = s2;
        s3 = peg$c5(s3, s4);
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    if (s2 !== peg$FAILED) {
      peg$savedPos = s1;
      s2 = peg$c6(s2);
    }
    s1 = s2;
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseScopeExpression();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c14(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseScopeExpression() {
    var s0, s1, s2, s3, s4, s5;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$parseActionExpression();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 94) {
          s3 = peg$c15;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c16);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseCodeBlock();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c17(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseActionExpression();
    }

    return s0;
  }

  function peg$parseActionExpression() {
    var s0, s1, s2, s3;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$parseSequenceExpression();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseCodeBlock();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c18(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseSequenceExpression();
    }

    return s0;
  }

  function peg$parseSequenceExpression() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseLabeledExpression();
    if (s2 !== peg$FAILED) {
      s3 = [];
      peg$transactions.unshift([]);
      s4 = peg$currPos;
      s5 = peg$parse__();
      if (s5 !== peg$FAILED) {
        s6 = peg$parseLabeledExpression();
        if (s6 !== peg$FAILED) {
          peg$savedPos = s4;
          s5 = peg$c4(s2, s6);
          s4 = s5;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        peg$transactions.unshift([]);
        s4 = peg$currPos;
        s5 = peg$parse__();
        if (s5 !== peg$FAILED) {
          s6 = peg$parseLabeledExpression();
          if (s6 !== peg$FAILED) {
            peg$savedPos = s4;
            s5 = peg$c4(s2, s6);
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s1;
        s2 = peg$c5(s2, s3);
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c19(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseLabeledExpression() {
    var s0, s1, s2, s3, s4, s5;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$parseIdentifier();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s3 = peg$c20;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c21);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsePrefixedExpression();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c22(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c23) {
        s1 = peg$c23;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c24);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsePrefixedExpression();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c25(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsePrefixedExpression();
      }
    }

    return s0;
  }

  function peg$parsePrefixedExpression() {
    var s0, s1, s2, s3;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$parsePrefixedOperator();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseSuffixedExpression();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c26(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseSuffixedExpression();
    }

    return s0;
  }

  function peg$parsePrefixedOperator() {
    var s0;

    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 36) {
      s0 = peg$c27;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c28);
      }
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 38) {
        s0 = peg$c29;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c30);
        }
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 33) {
          s0 = peg$c31;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c32);
          }
        }
      }
    }

    return s0;
  }

  function peg$parseSuffixedExpression() {
    var s0, s1, s2, s3;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$parsePrimaryExpression();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseSuffixedOperator();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c33(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsePrimaryExpression();
    }

    return s0;
  }

  function peg$parseSuffixedOperator() {
    var s0;

    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 63) {
      s0 = peg$c34;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c35);
      }
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 42) {
        s0 = peg$c36;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c37);
        }
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 43) {
          s0 = peg$c38;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c39);
          }
        }
      }
    }

    return s0;
  }

  function peg$parsePrimaryExpression() {
    var s0, s1, s2, s3, s4, s5;

    peg$transactions.unshift([]);
    s0 = peg$parseLiteralMatcher();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseCharacterClassMatcher();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$parseAnyMatcher();
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          peg$transactions.unshift([]);
          s0 = peg$parseEndMatcher();
          if (s0 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s0 === peg$FAILED) {
            peg$transactions.unshift([]);
            s0 = peg$parseRuleReferenceExpression();
            if (s0 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s0 === peg$FAILED) {
              peg$transactions.unshift([]);
              s0 = peg$parseSemanticPredicateExpression();
              if (s0 !== peg$FAILED) {
                peg$currentTransaction = peg$transactions.shift();
                if (peg$transactions.length > 0) {
                  peg$transactions[0].unshift(...peg$currentTransaction);
                } else {
                  peg$currentTransaction = undefined;
                }
              } else {
                peg$transactions.shift().forEach((fn) => fn());
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 40) {
                  s1 = peg$c40;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c41);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parse__();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parseExpression();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parse__();
                      if (s4 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 41) {
                          s5 = peg$c42;
                          peg$currPos++;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$c43);
                          }
                        }
                        if (s5 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c44(s3);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseRuleReferenceExpression() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    s1 = peg$parseIdentifierName();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        peg$transactions.unshift([]);
        s5 = peg$currPos;
        s6 = peg$parseStringLiteral();
        if (s6 !== peg$FAILED) {
          s7 = peg$parse__();
          if (s7 !== peg$FAILED) {
            s6 = [s6, s7];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s5 === peg$FAILED) {
          s5 = null;
        }
        if (s5 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s6 = peg$c8;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c9);
            }
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$currPos;
            peg$silentFails++;
            if (input.charCodeAt(peg$currPos) === 62) {
              s8 = peg$c45;
              peg$currPos++;
            } else {
              s8 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c46);
              }
            }
            peg$silentFails--;
            if (s8 === peg$FAILED) {
              s7 = void 0;
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c47(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSemanticPredicateExpression() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseSemanticPredicateOperator();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseCodeBlock();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c48(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSemanticPredicateOperator() {
    var s0;

    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 38) {
      s0 = peg$c29;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c30);
      }
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 33) {
        s0 = peg$c31;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c32);
        }
      }
    }

    return s0;
  }

  function peg$parseSourceCharacter() {
    var s0;

    if (input.length > peg$currPos) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c49);
      }
    }

    return s0;
  }

  function peg$parseWhiteSpace() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 9) {
      s2 = peg$c51;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c52);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 11) {
        s2 = peg$c53;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c54);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        peg$transactions.unshift([]);
        if (input.charCodeAt(peg$currPos) === 12) {
          s2 = peg$c55;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c56);
          }
        }
        if (s2 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s2 === peg$FAILED) {
          peg$transactions.unshift([]);
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c57;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c58);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s2 === peg$FAILED) {
            peg$transactions.unshift([]);
            if (input.charCodeAt(peg$currPos) === 160) {
              s2 = peg$c59;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c60);
              }
            }
            if (s2 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s2 === peg$FAILED) {
              peg$transactions.unshift([]);
              if (input.charCodeAt(peg$currPos) === 65279) {
                s2 = peg$c61;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c62);
                }
              }
              if (s2 !== peg$FAILED) {
                peg$currentTransaction = peg$transactions.shift();
                if (peg$transactions.length > 0) {
                  peg$transactions[0].unshift(...peg$currentTransaction);
                } else {
                  peg$currentTransaction = undefined;
                }
              } else {
                peg$transactions.shift().forEach((fn) => fn());
              }
              if (s2 === peg$FAILED) {
                s2 = peg$parseZs();
              }
            }
          }
        }
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        peg$transactions.unshift([]);
        peg$transactions.unshift([]);
        if (input.charCodeAt(peg$currPos) === 9) {
          s2 = peg$c51;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c52);
          }
        }
        if (s2 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s2 === peg$FAILED) {
          peg$transactions.unshift([]);
          if (input.charCodeAt(peg$currPos) === 11) {
            s2 = peg$c53;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c54);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s2 === peg$FAILED) {
            peg$transactions.unshift([]);
            if (input.charCodeAt(peg$currPos) === 12) {
              s2 = peg$c55;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c56);
              }
            }
            if (s2 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s2 === peg$FAILED) {
              peg$transactions.unshift([]);
              if (input.charCodeAt(peg$currPos) === 32) {
                s2 = peg$c57;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c58);
                }
              }
              if (s2 !== peg$FAILED) {
                peg$currentTransaction = peg$transactions.shift();
                if (peg$transactions.length > 0) {
                  peg$transactions[0].unshift(...peg$currentTransaction);
                } else {
                  peg$currentTransaction = undefined;
                }
              } else {
                peg$transactions.shift().forEach((fn) => fn());
              }
              if (s2 === peg$FAILED) {
                peg$transactions.unshift([]);
                if (input.charCodeAt(peg$currPos) === 160) {
                  s2 = peg$c59;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c60);
                  }
                }
                if (s2 !== peg$FAILED) {
                  peg$currentTransaction = peg$transactions.shift();
                  if (peg$transactions.length > 0) {
                    peg$transactions[0].unshift(...peg$currentTransaction);
                  } else {
                    peg$currentTransaction = undefined;
                  }
                } else {
                  peg$transactions.shift().forEach((fn) => fn());
                }
                if (s2 === peg$FAILED) {
                  peg$transactions.unshift([]);
                  if (input.charCodeAt(peg$currPos) === 65279) {
                    s2 = peg$c61;
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c62);
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    peg$currentTransaction = peg$transactions.shift();
                    if (peg$transactions.length > 0) {
                      peg$transactions[0].unshift(...peg$currentTransaction);
                    } else {
                      peg$currentTransaction = undefined;
                    }
                  } else {
                    peg$transactions.shift().forEach((fn) => fn());
                  }
                  if (s2 === peg$FAILED) {
                    s2 = peg$parseZs();
                  }
                }
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c50);
      }
    }

    return s0;
  }

  function peg$parseLineTerminator() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 10) {
      s2 = peg$c64;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c65);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.substr(peg$currPos, 2) === peg$c66) {
        s2 = peg$c66;
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c67);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        peg$transactions.unshift([]);
        if (input.charCodeAt(peg$currPos) === 13) {
          s2 = peg$c68;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c69);
          }
        }
        if (s2 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s2 === peg$FAILED) {
          peg$transactions.unshift([]);
          if (input.charCodeAt(peg$currPos) === 8232) {
            s2 = peg$c70;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c71);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 8233) {
              s2 = peg$c72;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c73);
              }
            }
          }
        }
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        peg$transactions.unshift([]);
        peg$transactions.unshift([]);
        if (input.charCodeAt(peg$currPos) === 10) {
          s2 = peg$c64;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c65);
          }
        }
        if (s2 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s2 === peg$FAILED) {
          peg$transactions.unshift([]);
          if (input.substr(peg$currPos, 2) === peg$c66) {
            s2 = peg$c66;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c67);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s2 === peg$FAILED) {
            peg$transactions.unshift([]);
            if (input.charCodeAt(peg$currPos) === 13) {
              s2 = peg$c68;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c69);
              }
            }
            if (s2 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s2 === peg$FAILED) {
              peg$transactions.unshift([]);
              if (input.charCodeAt(peg$currPos) === 8232) {
                s2 = peg$c70;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c71);
                }
              }
              if (s2 !== peg$FAILED) {
                peg$currentTransaction = peg$transactions.shift();
                if (peg$transactions.length > 0) {
                  peg$transactions[0].unshift(...peg$currentTransaction);
                } else {
                  peg$currentTransaction = undefined;
                }
              } else {
                peg$transactions.shift().forEach((fn) => fn());
              }
              if (s2 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 8233) {
                  s2 = peg$c72;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c73);
                  }
                }
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c63);
      }
    }

    return s0;
  }

  function peg$parseComment() {
    var s0, s1;

    peg$silentFails++;
    peg$transactions.unshift([]);
    s0 = peg$parseMultiLineComment();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseSingleLineComment();
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c74);
      }
    }

    return s0;
  }

  function peg$parseMultiLineComment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c75) {
      s1 = peg$c75;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c76);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      peg$transactions.unshift([]);
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c77) {
        s5 = peg$c77;
        peg$currPos += 2;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c78);
        }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        peg$transactions.unshift([]);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c77) {
          s5 = peg$c77;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c78);
          }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c77) {
          s3 = peg$c77;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c78);
          }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseMultiLineCommentNoLineTerminator() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c75) {
      s1 = peg$c75;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c76);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      peg$transactions.unshift([]);
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      peg$transactions.unshift([]);
      if (input.substr(peg$currPos, 2) === peg$c77) {
        s5 = peg$c77;
        peg$currPos += 2;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c78);
        }
      }
      if (s5 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s5 === peg$FAILED) {
        s5 = peg$parseLineTerminator();
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        peg$transactions.unshift([]);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        peg$transactions.unshift([]);
        if (input.substr(peg$currPos, 2) === peg$c77) {
          s5 = peg$c77;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c78);
          }
        }
        if (s5 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s5 === peg$FAILED) {
          s5 = peg$parseLineTerminator();
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c77) {
          s3 = peg$c77;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c78);
          }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSingleLineComment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c79) {
      s1 = peg$c79;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c80);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      peg$transactions.unshift([]);
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseLineTerminator();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        peg$transactions.unshift([]);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseLineTerminator();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseIdentifier() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    s2 = peg$parseReservedWord();
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseIdentifierName();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseIdentifierName() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    peg$transactions.unshift([]);
    s0 = peg$currPos;
    peg$transactions.unshift([]);
    s1 = peg$parseIdentifierStart();
    if (s1 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s1 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 36) {
        s1 = peg$c27;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c28);
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseIdentifierPart();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          peg$transactions.unshift([]);
          s3 = peg$parseIdentifierPart();
          if (s3 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c82(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseIdentifierStart();
      if (s1 !== peg$FAILED) {
        s2 = [];
        peg$transactions.unshift([]);
        s3 = peg$parseIdentifierPart();
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          peg$transactions.unshift([]);
          s3 = peg$parseIdentifierPart();
          if (s3 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c82(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c81);
      }
    }

    return s0;
  }

  function peg$parseIdentifierStart() {
    var s0, s1, s2;

    peg$transactions.unshift([]);
    s0 = peg$parseUnicodeLetter();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 95) {
        s0 = peg$c83;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c84);
        }
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
          s1 = peg$c85;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c86);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseUnicodeEscapeSequence();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c0(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parseIdentifierPart() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseIdentifierStart();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseUnicodeCombiningMark();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$parseNd();
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          peg$transactions.unshift([]);
          s0 = peg$parsePc();
          if (s0 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s0 === peg$FAILED) {
            peg$transactions.unshift([]);
            if (input.charCodeAt(peg$currPos) === 36) {
              s0 = peg$c27;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c28);
              }
            }
            if (s0 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s0 === peg$FAILED) {
              peg$transactions.unshift([]);
              if (input.charCodeAt(peg$currPos) === 8204) {
                s0 = peg$c87;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c88);
                }
              }
              if (s0 !== peg$FAILED) {
                peg$currentTransaction = peg$transactions.shift();
                if (peg$transactions.length > 0) {
                  peg$transactions[0].unshift(...peg$currentTransaction);
                } else {
                  peg$currentTransaction = undefined;
                }
              } else {
                peg$transactions.shift().forEach((fn) => fn());
              }
              if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 8205) {
                  s0 = peg$c89;
                  peg$currPos++;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c90);
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseUnicodeLetter() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseLu();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseLl();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$parseLt();
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          peg$transactions.unshift([]);
          s0 = peg$parseLm();
          if (s0 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s0 === peg$FAILED) {
            peg$transactions.unshift([]);
            s0 = peg$parseLo();
            if (s0 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s0 === peg$FAILED) {
              s0 = peg$parseNl();
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseUnicodeCombiningMark() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseMn();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseMc();
    }

    return s0;
  }

  function peg$parseReservedWord() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseKeyword();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseFutureReservedWord();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$parseNullToken();
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseBooleanLiteral();
        }
      }
    }

    return s0;
  }

  function peg$parseKeyword() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseBreakToken();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseCaseToken();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$parseCatchToken();
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          peg$transactions.unshift([]);
          s0 = peg$parseContinueToken();
          if (s0 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s0 === peg$FAILED) {
            peg$transactions.unshift([]);
            s0 = peg$parseDebuggerToken();
            if (s0 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s0 === peg$FAILED) {
              peg$transactions.unshift([]);
              s0 = peg$parseDefaultToken();
              if (s0 !== peg$FAILED) {
                peg$currentTransaction = peg$transactions.shift();
                if (peg$transactions.length > 0) {
                  peg$transactions[0].unshift(...peg$currentTransaction);
                } else {
                  peg$currentTransaction = undefined;
                }
              } else {
                peg$transactions.shift().forEach((fn) => fn());
              }
              if (s0 === peg$FAILED) {
                peg$transactions.unshift([]);
                s0 = peg$parseDeleteToken();
                if (s0 !== peg$FAILED) {
                  peg$currentTransaction = peg$transactions.shift();
                  if (peg$transactions.length > 0) {
                    peg$transactions[0].unshift(...peg$currentTransaction);
                  } else {
                    peg$currentTransaction = undefined;
                  }
                } else {
                  peg$transactions.shift().forEach((fn) => fn());
                }
                if (s0 === peg$FAILED) {
                  peg$transactions.unshift([]);
                  s0 = peg$parseDoToken();
                  if (s0 !== peg$FAILED) {
                    peg$currentTransaction = peg$transactions.shift();
                    if (peg$transactions.length > 0) {
                      peg$transactions[0].unshift(...peg$currentTransaction);
                    } else {
                      peg$currentTransaction = undefined;
                    }
                  } else {
                    peg$transactions.shift().forEach((fn) => fn());
                  }
                  if (s0 === peg$FAILED) {
                    peg$transactions.unshift([]);
                    s0 = peg$parseElseToken();
                    if (s0 !== peg$FAILED) {
                      peg$currentTransaction = peg$transactions.shift();
                      if (peg$transactions.length > 0) {
                        peg$transactions[0].unshift(...peg$currentTransaction);
                      } else {
                        peg$currentTransaction = undefined;
                      }
                    } else {
                      peg$transactions.shift().forEach((fn) => fn());
                    }
                    if (s0 === peg$FAILED) {
                      peg$transactions.unshift([]);
                      s0 = peg$parseFinallyToken();
                      if (s0 !== peg$FAILED) {
                        peg$currentTransaction = peg$transactions.shift();
                        if (peg$transactions.length > 0) {
                          peg$transactions[0].unshift(
                            ...peg$currentTransaction,
                          );
                        } else {
                          peg$currentTransaction = undefined;
                        }
                      } else {
                        peg$transactions.shift().forEach((fn) => fn());
                      }
                      if (s0 === peg$FAILED) {
                        peg$transactions.unshift([]);
                        s0 = peg$parseForToken();
                        if (s0 !== peg$FAILED) {
                          peg$currentTransaction = peg$transactions.shift();
                          if (peg$transactions.length > 0) {
                            peg$transactions[0].unshift(
                              ...peg$currentTransaction,
                            );
                          } else {
                            peg$currentTransaction = undefined;
                          }
                        } else {
                          peg$transactions.shift().forEach((fn) => fn());
                        }
                        if (s0 === peg$FAILED) {
                          peg$transactions.unshift([]);
                          s0 = peg$parseFunctionToken();
                          if (s0 !== peg$FAILED) {
                            peg$currentTransaction = peg$transactions.shift();
                            if (peg$transactions.length > 0) {
                              peg$transactions[0].unshift(
                                ...peg$currentTransaction,
                              );
                            } else {
                              peg$currentTransaction = undefined;
                            }
                          } else {
                            peg$transactions.shift().forEach((fn) => fn());
                          }
                          if (s0 === peg$FAILED) {
                            peg$transactions.unshift([]);
                            s0 = peg$parseIfToken();
                            if (s0 !== peg$FAILED) {
                              peg$currentTransaction = peg$transactions.shift();
                              if (peg$transactions.length > 0) {
                                peg$transactions[0].unshift(
                                  ...peg$currentTransaction,
                                );
                              } else {
                                peg$currentTransaction = undefined;
                              }
                            } else {
                              peg$transactions.shift().forEach((fn) => fn());
                            }
                            if (s0 === peg$FAILED) {
                              peg$transactions.unshift([]);
                              s0 = peg$parseInstanceofToken();
                              if (s0 !== peg$FAILED) {
                                peg$currentTransaction =
                                  peg$transactions.shift();
                                if (peg$transactions.length > 0) {
                                  peg$transactions[0].unshift(
                                    ...peg$currentTransaction,
                                  );
                                } else {
                                  peg$currentTransaction = undefined;
                                }
                              } else {
                                peg$transactions.shift().forEach((fn) => fn());
                              }
                              if (s0 === peg$FAILED) {
                                peg$transactions.unshift([]);
                                s0 = peg$parseInToken();
                                if (s0 !== peg$FAILED) {
                                  peg$currentTransaction =
                                    peg$transactions.shift();
                                  if (peg$transactions.length > 0) {
                                    peg$transactions[0].unshift(
                                      ...peg$currentTransaction,
                                    );
                                  } else {
                                    peg$currentTransaction = undefined;
                                  }
                                } else {
                                  peg$transactions
                                    .shift()
                                    .forEach((fn) => fn());
                                }
                                if (s0 === peg$FAILED) {
                                  peg$transactions.unshift([]);
                                  s0 = peg$parseNewToken();
                                  if (s0 !== peg$FAILED) {
                                    peg$currentTransaction =
                                      peg$transactions.shift();
                                    if (peg$transactions.length > 0) {
                                      peg$transactions[0].unshift(
                                        ...peg$currentTransaction,
                                      );
                                    } else {
                                      peg$currentTransaction = undefined;
                                    }
                                  } else {
                                    peg$transactions
                                      .shift()
                                      .forEach((fn) => fn());
                                  }
                                  if (s0 === peg$FAILED) {
                                    peg$transactions.unshift([]);
                                    s0 = peg$parseReturnToken();
                                    if (s0 !== peg$FAILED) {
                                      peg$currentTransaction =
                                        peg$transactions.shift();
                                      if (peg$transactions.length > 0) {
                                        peg$transactions[0].unshift(
                                          ...peg$currentTransaction,
                                        );
                                      } else {
                                        peg$currentTransaction = undefined;
                                      }
                                    } else {
                                      peg$transactions
                                        .shift()
                                        .forEach((fn) => fn());
                                    }
                                    if (s0 === peg$FAILED) {
                                      peg$transactions.unshift([]);
                                      s0 = peg$parseSwitchToken();
                                      if (s0 !== peg$FAILED) {
                                        peg$currentTransaction =
                                          peg$transactions.shift();
                                        if (peg$transactions.length > 0) {
                                          peg$transactions[0].unshift(
                                            ...peg$currentTransaction,
                                          );
                                        } else {
                                          peg$currentTransaction = undefined;
                                        }
                                      } else {
                                        peg$transactions
                                          .shift()
                                          .forEach((fn) => fn());
                                      }
                                      if (s0 === peg$FAILED) {
                                        peg$transactions.unshift([]);
                                        s0 = peg$parseThisToken();
                                        if (s0 !== peg$FAILED) {
                                          peg$currentTransaction =
                                            peg$transactions.shift();
                                          if (peg$transactions.length > 0) {
                                            peg$transactions[0].unshift(
                                              ...peg$currentTransaction,
                                            );
                                          } else {
                                            peg$currentTransaction = undefined;
                                          }
                                        } else {
                                          peg$transactions
                                            .shift()
                                            .forEach((fn) => fn());
                                        }
                                        if (s0 === peg$FAILED) {
                                          peg$transactions.unshift([]);
                                          s0 = peg$parseThrowToken();
                                          if (s0 !== peg$FAILED) {
                                            peg$currentTransaction =
                                              peg$transactions.shift();
                                            if (peg$transactions.length > 0) {
                                              peg$transactions[0].unshift(
                                                ...peg$currentTransaction,
                                              );
                                            } else {
                                              peg$currentTransaction =
                                                undefined;
                                            }
                                          } else {
                                            peg$transactions
                                              .shift()
                                              .forEach((fn) => fn());
                                          }
                                          if (s0 === peg$FAILED) {
                                            peg$transactions.unshift([]);
                                            s0 = peg$parseTryToken();
                                            if (s0 !== peg$FAILED) {
                                              peg$currentTransaction =
                                                peg$transactions.shift();
                                              if (peg$transactions.length > 0) {
                                                peg$transactions[0].unshift(
                                                  ...peg$currentTransaction,
                                                );
                                              } else {
                                                peg$currentTransaction =
                                                  undefined;
                                              }
                                            } else {
                                              peg$transactions
                                                .shift()
                                                .forEach((fn) => fn());
                                            }
                                            if (s0 === peg$FAILED) {
                                              peg$transactions.unshift([]);
                                              s0 = peg$parseTypeofToken();
                                              if (s0 !== peg$FAILED) {
                                                peg$currentTransaction =
                                                  peg$transactions.shift();
                                                if (
                                                  peg$transactions.length > 0
                                                ) {
                                                  peg$transactions[0].unshift(
                                                    ...peg$currentTransaction,
                                                  );
                                                } else {
                                                  peg$currentTransaction =
                                                    undefined;
                                                }
                                              } else {
                                                peg$transactions
                                                  .shift()
                                                  .forEach((fn) => fn());
                                              }
                                              if (s0 === peg$FAILED) {
                                                peg$transactions.unshift([]);
                                                s0 = peg$parseVarToken();
                                                if (s0 !== peg$FAILED) {
                                                  peg$currentTransaction =
                                                    peg$transactions.shift();
                                                  if (
                                                    peg$transactions.length > 0
                                                  ) {
                                                    peg$transactions[0].unshift(
                                                      ...peg$currentTransaction,
                                                    );
                                                  } else {
                                                    peg$currentTransaction =
                                                      undefined;
                                                  }
                                                } else {
                                                  peg$transactions
                                                    .shift()
                                                    .forEach((fn) => fn());
                                                }
                                                if (s0 === peg$FAILED) {
                                                  peg$transactions.unshift([]);
                                                  s0 = peg$parseVoidToken();
                                                  if (s0 !== peg$FAILED) {
                                                    peg$currentTransaction =
                                                      peg$transactions.shift();
                                                    if (
                                                      peg$transactions.length >
                                                      0
                                                    ) {
                                                      peg$transactions[0].unshift(
                                                        ...peg$currentTransaction,
                                                      );
                                                    } else {
                                                      peg$currentTransaction =
                                                        undefined;
                                                    }
                                                  } else {
                                                    peg$transactions
                                                      .shift()
                                                      .forEach((fn) => fn());
                                                  }
                                                  if (s0 === peg$FAILED) {
                                                    peg$transactions.unshift(
                                                      [],
                                                    );
                                                    s0 = peg$parseWhileToken();
                                                    if (s0 !== peg$FAILED) {
                                                      peg$currentTransaction =
                                                        peg$transactions.shift();
                                                      if (
                                                        peg$transactions.length >
                                                        0
                                                      ) {
                                                        peg$transactions[0].unshift(
                                                          ...peg$currentTransaction,
                                                        );
                                                      } else {
                                                        peg$currentTransaction =
                                                          undefined;
                                                      }
                                                    } else {
                                                      peg$transactions
                                                        .shift()
                                                        .forEach((fn) => fn());
                                                    }
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$parseWithToken();
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseFutureReservedWord() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseClassToken();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseConstToken();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$parseEnumToken();
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          peg$transactions.unshift([]);
          s0 = peg$parseExportToken();
          if (s0 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s0 === peg$FAILED) {
            peg$transactions.unshift([]);
            s0 = peg$parseExtendsToken();
            if (s0 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s0 === peg$FAILED) {
              peg$transactions.unshift([]);
              s0 = peg$parseImportToken();
              if (s0 !== peg$FAILED) {
                peg$currentTransaction = peg$transactions.shift();
                if (peg$transactions.length > 0) {
                  peg$transactions[0].unshift(...peg$currentTransaction);
                } else {
                  peg$currentTransaction = undefined;
                }
              } else {
                peg$transactions.shift().forEach((fn) => fn());
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseSuperToken();
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseBooleanLiteral() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseTrueToken();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseFalseToken();
    }

    return s0;
  }

  function peg$parseAnnotation() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseIfAnnotation();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseSeparatorAnnotation();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$parseTokenAnnotation();
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseTypeAnnotation();
        }
      }
    }

    return s0;
  }

  function peg$parseIfAnnotation() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c91) {
      s1 = peg$c91;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c92);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = [];
        peg$transactions.unshift([]);
        s4 = peg$parseIdentifier();
        if (s4 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          peg$transactions.unshift([]);
          s4 = peg$parseIdentifier();
          if (s4 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s5 = peg$c42;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c43);
              }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c93(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSeparatorAnnotation() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 11) === peg$c94) {
      s1 = peg$c94;
      peg$currPos += 11;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c95);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.substr(peg$currPos, 5) === peg$c96) {
        s2 = peg$c96;
        peg$currPos += 5;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c97);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseExpression();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s6 = peg$c42;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c43);
                }
              }
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c98(s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTypeAnnotation() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c99) {
      s1 = peg$c99;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c100);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.substr(peg$currPos, 5) === peg$c101) {
        s2 = peg$c101;
        peg$currPos += 5;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c102);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse__();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseStringLiteral();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s6 = peg$c42;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c43);
                }
              }
              if (s6 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c103(s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTokenAnnotation() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c104) {
      s1 = peg$c104;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c105);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        peg$transactions.unshift([]);
        s3 = peg$parseAnnotationParameters();
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s5 = peg$c42;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c43);
              }
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c106(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseAnnotationParameters() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$transactions.unshift([]);
    s2 = peg$currPos;
    s3 = peg$parseAnnotationParameter();
    if (s3 !== peg$FAILED) {
      s4 = [];
      peg$transactions.unshift([]);
      s5 = peg$currPos;
      s6 = peg$currPos;
      s7 = peg$parse__();
      if (s7 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 44) {
          s8 = peg$c107;
          peg$currPos++;
        } else {
          s8 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c108);
          }
        }
        if (s8 !== peg$FAILED) {
          s9 = peg$parse__();
          if (s9 !== peg$FAILED) {
            s7 = [s7, s8, s9];
            s6 = s7;
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
      } else {
        peg$currPos = s6;
        s6 = peg$FAILED;
      }
      if (s6 !== peg$FAILED) {
        s7 = peg$parseAnnotationParameter();
        if (s7 !== peg$FAILED) {
          peg$savedPos = s5;
          s6 = peg$c4(s3, s7);
          s5 = s6;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      if (s5 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        peg$transactions.unshift([]);
        s5 = peg$currPos;
        s6 = peg$currPos;
        s7 = peg$parse__();
        if (s7 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s8 = peg$c107;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c108);
            }
          }
          if (s8 !== peg$FAILED) {
            s9 = peg$parse__();
            if (s9 !== peg$FAILED) {
              s7 = [s7, s8, s9];
              s6 = s7;
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parseAnnotationParameter();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s5;
            s6 = peg$c4(s3, s7);
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s4 !== peg$FAILED) {
        peg$savedPos = s2;
        s3 = peg$c5(s3, s4);
        s2 = s3;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    if (s2 !== peg$FAILED) {
      peg$savedPos = s1;
      s2 = peg$c6(s2);
    }
    s1 = s2;
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c109(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseAnnotationParameter() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseIdentifier();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s3 = peg$c20;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c21);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseValueLiteral();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c110(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseLiteralMatcher() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseStringLiteral();
    if (s1 !== peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 105) {
        s2 = peg$c111;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c112);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c113(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseValueLiteral() {
    var s0, s1;

    peg$transactions.unshift([]);
    s0 = peg$parseStringLiteral();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseArrayLiteral();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$currPos;
        s1 = peg$parseBooleanLiteral();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c114();
        }
        s0 = s1;
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseNullToken();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c115();
          }
          s0 = s1;
        }
      }
    }

    return s0;
  }

  function peg$parseArrayLiteral() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c117;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c118);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$transactions.unshift([]);
      s2 = peg$parseArrayValues();
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 93) {
          s3 = peg$c119;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c120);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c121(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c116);
      }
    }

    return s0;
  }

  function peg$parseArrayValues() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    peg$transactions.unshift([]);
    s1 = peg$currPos;
    s2 = peg$parseValueLiteral();
    if (s2 !== peg$FAILED) {
      s3 = [];
      peg$transactions.unshift([]);
      s4 = peg$currPos;
      s5 = peg$currPos;
      s6 = peg$parse__();
      if (s6 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 44) {
          s7 = peg$c107;
          peg$currPos++;
        } else {
          s7 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c108);
          }
        }
        if (s7 !== peg$FAILED) {
          s8 = peg$parse__();
          if (s8 !== peg$FAILED) {
            s6 = [s6, s7, s8];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
      } else {
        peg$currPos = s5;
        s5 = peg$FAILED;
      }
      if (s5 !== peg$FAILED) {
        s6 = peg$parseValueLiteral();
        if (s6 !== peg$FAILED) {
          peg$savedPos = s4;
          s5 = peg$c4(s2, s6);
          s4 = s5;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        peg$transactions.unshift([]);
        s4 = peg$currPos;
        s5 = peg$currPos;
        s6 = peg$parse__();
        if (s6 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s7 = peg$c107;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c108);
            }
          }
          if (s7 !== peg$FAILED) {
            s8 = peg$parse__();
            if (s8 !== peg$FAILED) {
              s6 = [s6, s7, s8];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parseValueLiteral();
          if (s6 !== peg$FAILED) {
            peg$savedPos = s4;
            s5 = peg$c4(s2, s6);
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s1;
        s2 = peg$c5(s2, s3);
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c6(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseStringLiteral() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    peg$transactions.unshift([]);
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 96) {
      s1 = peg$c123;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c124);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      peg$transactions.unshift([]);
      s3 = peg$parseBacktickStringCharacter();
      if (s3 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        peg$transactions.unshift([]);
        s3 = peg$parseBacktickStringCharacter();
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 96) {
          s3 = peg$c123;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c124);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c125(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c126;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c127);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        peg$transactions.unshift([]);
        s3 = peg$parseDoubleStringCharacter();
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          peg$transactions.unshift([]);
          s3 = peg$parseDoubleStringCharacter();
          if (s3 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c126;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c127);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c125(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s1 = peg$c128;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c129);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          peg$transactions.unshift([]);
          s3 = peg$parseSingleStringCharacter();
          if (s3 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            peg$transactions.unshift([]);
            s3 = peg$parseSingleStringCharacter();
            if (s3 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s3 = peg$c128;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c129);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c125(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c122);
      }
    }

    return s0;
  }

  function peg$parseBacktickStringCharacter() {
    var s0, s1, s2;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 96) {
      s2 = peg$c123;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c124);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c85;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c86);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parseLineTerminator();
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c130();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c85;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c86);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEscapeSequence();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c131(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseLineContinuation();
      }
    }

    return s0;
  }

  function peg$parseDoubleStringCharacter() {
    var s0, s1, s2;

    peg$silentFails++;
    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 34) {
      s2 = peg$c126;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c127);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c85;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c86);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parseLineTerminator();
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c130();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c85;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c86);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEscapeSequence();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c131(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseLineContinuation();
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c132);
      }
    }

    return s0;
  }

  function peg$parseSingleStringCharacter() {
    var s0, s1, s2;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 39) {
      s2 = peg$c128;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c129);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c85;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c86);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parseLineTerminator();
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c130();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c85;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c86);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEscapeSequence();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c131(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseLineContinuation();
      }
    }

    return s0;
  }

  function peg$parseCharacterClassMatcher() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c117;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c118);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 94) {
        s2 = peg$c15;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c16);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        peg$transactions.unshift([]);
        peg$transactions.unshift([]);
        s4 = peg$parseClassCharacterRange();
        if (s4 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s4 === peg$FAILED) {
          s4 = peg$parseClassCharacter();
        }
        if (s4 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          peg$transactions.unshift([]);
          peg$transactions.unshift([]);
          s4 = peg$parseClassCharacterRange();
          if (s4 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s4 === peg$FAILED) {
            s4 = peg$parseClassCharacter();
          }
          if (s4 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s4 = peg$c119;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c120);
            }
          }
          if (s4 !== peg$FAILED) {
            peg$transactions.unshift([]);
            if (input.charCodeAt(peg$currPos) === 105) {
              s5 = peg$c111;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c112);
              }
            }
            if (s5 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c134(s2, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c133);
      }
    }

    return s0;
  }

  function peg$parseClassCharacterRange() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseClassCharacter();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c135;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c136);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseClassCharacter();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c137(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseClassCharacter() {
    var s0, s1, s2;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    peg$transactions.unshift([]);
    if (input.charCodeAt(peg$currPos) === 93) {
      s2 = peg$c119;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c120);
      }
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      peg$transactions.unshift([]);
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c85;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c86);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parseLineTerminator();
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c130();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c85;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c86);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEscapeSequence();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c131(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseLineContinuation();
      }
    }

    return s0;
  }

  function peg$parseLineContinuation() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 92) {
      s1 = peg$c85;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c86);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseLineTerminator();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c138();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEscapeSequence() {
    var s0, s1, s2, s3;

    peg$transactions.unshift([]);
    s0 = peg$parseCharacterEscapeSequence();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c139;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c140);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseDecimalDigit();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c141();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$parseHexEscapeSequence();
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseUnicodeEscapeSequence();
        }
      }
    }

    return s0;
  }

  function peg$parseCharacterEscapeSequence() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseSingleEscapeCharacter();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseNonEscapeCharacter();
    }

    return s0;
  }

  function peg$parseSingleEscapeCharacter() {
    var s0, s1;

    peg$transactions.unshift([]);
    if (peg$c142.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c143);
      }
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 98) {
        s1 = peg$c144;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c145);
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c146();
      }
      s0 = s1;
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 102) {
          s1 = peg$c147;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c148);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c149();
        }
        s0 = s1;
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          peg$transactions.unshift([]);
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 110) {
            s1 = peg$c150;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c151);
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c152();
          }
          s0 = s1;
          if (s0 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s0 === peg$FAILED) {
            peg$transactions.unshift([]);
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 114) {
              s1 = peg$c153;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c154);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c155();
            }
            s0 = s1;
            if (s0 !== peg$FAILED) {
              peg$currentTransaction = peg$transactions.shift();
              if (peg$transactions.length > 0) {
                peg$transactions[0].unshift(...peg$currentTransaction);
              } else {
                peg$currentTransaction = undefined;
              }
            } else {
              peg$transactions.shift().forEach((fn) => fn());
            }
            if (s0 === peg$FAILED) {
              peg$transactions.unshift([]);
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 116) {
                s1 = peg$c156;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c157);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c158();
              }
              s0 = s1;
              if (s0 !== peg$FAILED) {
                peg$currentTransaction = peg$transactions.shift();
                if (peg$transactions.length > 0) {
                  peg$transactions[0].unshift(...peg$currentTransaction);
                } else {
                  peg$currentTransaction = undefined;
                }
              } else {
                peg$transactions.shift().forEach((fn) => fn());
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 118) {
                  s1 = peg$c159;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c160);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c161();
                }
                s0 = s1;
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseNonEscapeCharacter() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    peg$transactions.unshift([]);
    s2 = peg$parseEscapeCharacter();
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      s2 = peg$parseLineTerminator();
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c130();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEscapeCharacter() {
    var s0;

    peg$transactions.unshift([]);
    s0 = peg$parseSingleEscapeCharacter();
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$parseDecimalDigit();
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        peg$transactions.unshift([]);
        if (input.charCodeAt(peg$currPos) === 120) {
          s0 = peg$c162;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c163);
          }
        }
        if (s0 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 117) {
            s0 = peg$c164;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c165);
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseHexEscapeSequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 120) {
      s1 = peg$c162;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c163);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$currPos;
      s4 = peg$parseHexDigit();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseHexDigit();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c166(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseUnicodeEscapeSequence() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 117) {
      s1 = peg$c164;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c165);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$currPos;
      s4 = peg$parseHexDigit();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseHexDigit();
        if (s5 !== peg$FAILED) {
          s6 = peg$parseHexDigit();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseHexDigit();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c166(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDecimalDigit() {
    var s0;

    if (peg$c167.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c168);
      }
    }

    return s0;
  }

  function peg$parseHexDigit() {
    var s0;

    if (peg$c169.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c170);
      }
    }

    return s0;
  }

  function peg$parseAnyMatcher() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 46) {
      s1 = peg$c171;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c172);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c173();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseEndMatcher() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 36) {
      s1 = peg$c27;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c28);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c174();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseCodeBlock() {
    var s0, s1, s2, s3, s4, s5, s6;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 123) {
      s1 = peg$c175;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c176);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseCodeBraces();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 125) {
          s3 = peg$c177;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c178);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c179(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c180) {
        s1 = peg$c180;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c181);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 40) {
            s4 = peg$c40;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c41);
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseCodeParen();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s6 = peg$c42;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c43);
                }
              }
              if (s6 !== peg$FAILED) {
                peg$savedPos = s3;
                s4 = peg$c0(s5);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c182(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parseCodeBraces() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = [];
    peg$transactions.unshift([]);
    peg$transactions.unshift([]);
    s2 = [];
    s3 = peg$currPos;
    s4 = peg$currPos;
    peg$silentFails++;
    if (peg$c183.test(input.charAt(peg$currPos))) {
      s5 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s5 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c184);
      }
    }
    peg$silentFails--;
    if (s5 === peg$FAILED) {
      s4 = void 0;
    } else {
      peg$currPos = s4;
      s4 = peg$FAILED;
    }
    if (s4 !== peg$FAILED) {
      s5 = peg$parseSourceCharacter();
      if (s5 !== peg$FAILED) {
        s4 = [s4, s5];
        s3 = s4;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        peg$transactions.unshift([]);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (peg$c183.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c184);
          }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s3 = peg$c175;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c176);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parseCodeBraces();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 125) {
            s5 = peg$c177;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c178);
            }
          }
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      peg$transactions.unshift([]);
      peg$transactions.unshift([]);
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (peg$c183.test(input.charAt(peg$currPos))) {
        s5 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c184);
        }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          peg$transactions.unshift([]);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (peg$c183.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c184);
            }
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s3 = peg$c175;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c176);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parseCodeBraces();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s5 = peg$c177;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c178);
              }
            }
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }

    return s0;
  }

  function peg$parseCodeParen() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = [];
    peg$transactions.unshift([]);
    peg$transactions.unshift([]);
    s2 = [];
    s3 = peg$currPos;
    s4 = peg$currPos;
    peg$silentFails++;
    if (peg$c185.test(input.charAt(peg$currPos))) {
      s5 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s5 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c186);
      }
    }
    peg$silentFails--;
    if (s5 === peg$FAILED) {
      s4 = void 0;
    } else {
      peg$currPos = s4;
      s4 = peg$FAILED;
    }
    if (s4 !== peg$FAILED) {
      s5 = peg$parseSourceCharacter();
      if (s5 !== peg$FAILED) {
        s4 = [s4, s5];
        s3 = s4;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        peg$transactions.unshift([]);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (peg$c185.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c186);
          }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s2 === peg$FAILED) {
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s3 = peg$c40;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c41);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parseCodeParen();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s5 = peg$c42;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c43);
            }
          }
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    }
    if (s2 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      peg$transactions.unshift([]);
      peg$transactions.unshift([]);
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (peg$c185.test(input.charAt(peg$currPos))) {
        s5 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c186);
        }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          peg$transactions.unshift([]);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (peg$c185.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c186);
            }
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s2 === peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 40) {
          s3 = peg$c40;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c41);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parseCodeParen();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s5 = peg$c42;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c43);
              }
            }
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }

    return s0;
  }

  function peg$parseLl() {
    var s0;

    if (peg$c187.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c188);
      }
    }

    return s0;
  }

  function peg$parseLm() {
    var s0;

    if (peg$c189.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c190);
      }
    }

    return s0;
  }

  function peg$parseLo() {
    var s0;

    if (peg$c191.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c192);
      }
    }

    return s0;
  }

  function peg$parseLt() {
    var s0;

    if (peg$c193.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c194);
      }
    }

    return s0;
  }

  function peg$parseLu() {
    var s0;

    if (peg$c195.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c196);
      }
    }

    return s0;
  }

  function peg$parseMc() {
    var s0;

    if (peg$c197.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c198);
      }
    }

    return s0;
  }

  function peg$parseMn() {
    var s0;

    if (peg$c199.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c200);
      }
    }

    return s0;
  }

  function peg$parseNd() {
    var s0;

    if (peg$c201.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c202);
      }
    }

    return s0;
  }

  function peg$parseNl() {
    var s0;

    if (peg$c203.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c204);
      }
    }

    return s0;
  }

  function peg$parsePc() {
    var s0;

    if (peg$c205.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c206);
      }
    }

    return s0;
  }

  function peg$parseZs() {
    var s0;

    if (peg$c207.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c208);
      }
    }

    return s0;
  }

  function peg$parseBreakToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c209) {
      s1 = peg$c209;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c210);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseCaseToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c211) {
      s1 = peg$c211;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c212);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseCatchToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c213) {
      s1 = peg$c213;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c214);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseClassToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c215) {
      s1 = peg$c215;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c216);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseConstToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c217) {
      s1 = peg$c217;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c218);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseContinueToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8) === peg$c219) {
      s1 = peg$c219;
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c220);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDebuggerToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8) === peg$c221) {
      s1 = peg$c221;
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c222);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDefaultToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c223) {
      s1 = peg$c223;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c224);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDeleteToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c225) {
      s1 = peg$c225;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c226);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDoToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c227) {
      s1 = peg$c227;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c228);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseElseToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c229) {
      s1 = peg$c229;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c230);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEnumToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c231) {
      s1 = peg$c231;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c232);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseExportToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c233) {
      s1 = peg$c233;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c234);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseExtendsToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c235) {
      s1 = peg$c235;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c236);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseFalseToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c237) {
      s1 = peg$c237;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c238);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseFinallyToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c239) {
      s1 = peg$c239;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c240);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseForToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c241) {
      s1 = peg$c241;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c242);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseFunctionToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8) === peg$c243) {
      s1 = peg$c243;
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c244);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseIfToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c245) {
      s1 = peg$c245;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c246);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseImportToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c247) {
      s1 = peg$c247;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c248);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseInstanceofToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 10) === peg$c249) {
      s1 = peg$c249;
      peg$currPos += 10;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c250);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseInToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c251) {
      s1 = peg$c251;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c252);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseNewToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c253) {
      s1 = peg$c253;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c254);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseNullToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c255) {
      s1 = peg$c255;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c256);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseReturnToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c257) {
      s1 = peg$c257;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c258);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSuperToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c259) {
      s1 = peg$c259;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c260);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSwitchToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c261) {
      s1 = peg$c261;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c262);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseThisToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c263) {
      s1 = peg$c263;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c264);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseThrowToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c265) {
      s1 = peg$c265;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c266);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTrueToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c267) {
      s1 = peg$c267;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c268);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTryToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c269) {
      s1 = peg$c269;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c270);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTypeofToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c271) {
      s1 = peg$c271;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c272);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseVarToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c273) {
      s1 = peg$c273;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c274);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseVoidToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c275) {
      s1 = peg$c275;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c276);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseWhileToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c277) {
      s1 = peg$c277;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c278);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseWithToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c279) {
      s1 = peg$c279;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c280);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parse__() {
    var s0, s1, s2, s3;

    s0 = [];
    peg$transactions.unshift([]);
    peg$transactions.unshift([]);
    s1 = peg$currPos;
    s2 = [];
    peg$transactions.unshift([]);
    s3 = peg$parseWhiteSpace();
    if (s3 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s3 === peg$FAILED) {
      s3 = peg$parseLineTerminator();
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        peg$transactions.unshift([]);
        peg$transactions.unshift([]);
        s3 = peg$parseWhiteSpace();
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s3 === peg$FAILED) {
          s3 = peg$parseLineTerminator();
        }
        if (s3 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s1 === peg$FAILED) {
      s1 = peg$parseComment();
    }
    if (s1 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      peg$transactions.unshift([]);
      peg$transactions.unshift([]);
      s1 = peg$currPos;
      s2 = [];
      peg$transactions.unshift([]);
      s3 = peg$parseWhiteSpace();
      if (s3 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s3 === peg$FAILED) {
        s3 = peg$parseLineTerminator();
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          peg$transactions.unshift([]);
          peg$transactions.unshift([]);
          s3 = peg$parseWhiteSpace();
          if (s3 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
          if (s3 === peg$FAILED) {
            s3 = peg$parseLineTerminator();
          }
          if (s3 !== peg$FAILED) {
            peg$currentTransaction = peg$transactions.shift();
            if (peg$transactions.length > 0) {
              peg$transactions[0].unshift(...peg$currentTransaction);
            } else {
              peg$currentTransaction = undefined;
            }
          } else {
            peg$transactions.shift().forEach((fn) => fn());
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s1 === peg$FAILED) {
        s1 = peg$parseComment();
      }
      if (s1 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
    }

    return s0;
  }

  function peg$parse_() {
    var s0, s1;

    s0 = [];
    peg$transactions.unshift([]);
    peg$transactions.unshift([]);
    s1 = peg$parseWhiteSpace();
    if (s1 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s1 === peg$FAILED) {
      s1 = peg$parseMultiLineCommentNoLineTerminator();
    }
    if (s1 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      peg$transactions.unshift([]);
      peg$transactions.unshift([]);
      s1 = peg$parseWhiteSpace();
      if (s1 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s1 === peg$FAILED) {
        s1 = peg$parseMultiLineCommentNoLineTerminator();
      }
      if (s1 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
    }

    return s0;
  }

  function peg$parseEOS() {
    var s0, s1, s2, s3;

    peg$transactions.unshift([]);
    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 59) {
        s2 = peg$c281;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c282);
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 !== peg$FAILED) {
      peg$currentTransaction = peg$transactions.shift();
      if (peg$transactions.length > 0) {
        peg$transactions[0].unshift(...peg$currentTransaction);
      } else {
        peg$currentTransaction = undefined;
      }
    } else {
      peg$transactions.shift().forEach((fn) => fn());
    }
    if (s0 === peg$FAILED) {
      peg$transactions.unshift([]);
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        peg$transactions.unshift([]);
        s2 = peg$parseSingleLineComment();
        if (s2 !== peg$FAILED) {
          peg$currentTransaction = peg$transactions.shift();
          if (peg$transactions.length > 0) {
            peg$transactions[0].unshift(...peg$currentTransaction);
          } else {
            peg$currentTransaction = undefined;
          }
        } else {
          peg$transactions.shift().forEach((fn) => fn());
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseLineTerminator();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 !== peg$FAILED) {
        peg$currentTransaction = peg$transactions.shift();
        if (peg$transactions.length > 0) {
          peg$transactions[0].unshift(...peg$currentTransaction);
        } else {
          peg$currentTransaction = undefined;
        }
      } else {
        peg$transactions.shift().forEach((fn) => fn());
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse__();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseEOF();
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parseEOF() {
    var s0, s1;

    s0 = peg$currPos;
    peg$silentFails++;
    if (input.length > peg$currPos) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$c49);
      }
    }
    peg$silentFails--;
    if (s1 === peg$FAILED) {
      s0 = void 0;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  const OPS_TO_PREFIXED_TYPES = {
    [`$`]: `text`,
    [`&`]: `simpleAnd`,
    [`!`]: `simpleNot`,
  };

  const OPS_TO_SUFFIXED_TYPES = {
    [`?`]: `optional`,
    [`*`]: `zeroOrMore`,
    [`+`]: `oneOrMore`,
  };

  const OPS_TO_SEMANTIC_PREDICATE_TYPES = {
    [`&`]: `semanticAnd`,
    [`!`]: `semanticNot`,
  };

  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    var invalidToken = peg$inferToken(peg$maxFailPos);

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      invalidToken,
      invalidToken
        ? peg$computeLocation(
            peg$maxFailPos,
            peg$maxFailPos + invalidToken.length,
          )
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos),
    );
  }
}

module.exports = { SyntaxError: peg$SyntaxError, parse: peg$parse };
