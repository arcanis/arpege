import {asts, parser, VisitFn, visitor} from 'arpege';
import format                           from 'pretty-format';

declare global {
  namespace jest {
    interface Matchers<R> {
      toChangeAST(grammar: string, details?: any, options?: any): R;
      toReportError(grammar: string, details?: any): R;
      toParseAs(expected: any): R;
      toFailToParse(details?: any): R;
      toParseLanguage(grammar: string, expected?: any, options?: any): R;
      toFailToParseLanguage(grammar: string, details?: any): R;
    }
  }
}

const stripLocation = (function() {
  function stripLeaf(visit: VisitFn, node: asts.Node) {
    delete node.location;
  }

  function stripExpression(visit: VisitFn, node: asts.NodeWithExpression) {
    delete node.location;

    visit(node.expression);
  }

  function stripChildren(property: string) {
    return (visit: VisitFn, node: asts.Node) => {
      delete node.location;

      for (const child of (node as any)[property]) {
        visit(child);
      }
    };
  }

  return visitor.build({
    grammar(visit, node) {
      delete node.location;

      if (node.initializer)
        visit(node.initializer);

      for (let i = 0; i < node.rules.length; i++) {
        visit(node.rules[i]);
      }
    },

    initializer: stripLeaf,
    rule: stripExpression,
    named: stripExpression,
    choice: stripChildren(`alternatives`),
    action: stripExpression,
    transform: stripExpression,
    scope: stripExpression,
    sequence: stripChildren(`elements`),
    labeled: stripExpression,
    text: stripExpression,
    simpleAnd: stripExpression,
    simpleNot: stripExpression,
    optional: stripExpression,
    zeroOrMore: stripExpression,
    oneOrMore: stripExpression,
    group: stripExpression,
    semanticAnd: stripLeaf,
    semanticNot: stripLeaf,
    ruleRef: stripLeaf,
    literal: stripLeaf,
    class: stripLeaf,
    any: stripLeaf,
  });
})();

beforeEach(() => {
  expect.extend({
    toChangeAST(received, grammar, details, options) {
      options = options !== undefined ? options : {};

      var ast = parser.parse(grammar);
      received(ast, options);

      if (this.isNot)
        expect(ast).not.toMatchObject(details);
      else
        expect(ast).toMatchObject(details);

      return {
        message: () => ``,
        pass: true,
      };
    },

    toReportError(received, grammar, details) {
      const ast = parser.parse(grammar);

      try {
        received(ast);
      } catch (e: any) {
        if (this.isNot) {
          return {
            message: () => `Expected the pass not to report an error for grammar ${format(grammar)}, but it did.`,
            pass: false,
          };
        } else {
          if (typeof details !== `undefined`) {
            if (this.isNot) {
              expect(details).not.toMatchObject(details);
            } else {
              expect(details).toMatchObject(details);
            }
          }
        }

        return {
          message: () => ``,
          pass: true,
        };
      }

      return {
        message: () => `Expected the pass to report an error ${details ? `with details ${format(details)} ` : ``}for grammar ${format(grammar)}, but it didn't.`,
        pass: false,
      };
    },

    toParseAs(received, expected) {
      let result: any;
      try {
        result = parser.parse(received);
      } catch (e: any) {
        return {
          message: () => `Expected ${format(received)} to parse as ${format(expected)}, but it failed to parse with message ${format(e.message)}.`,
          pass: false,
        };
      }

      stripLocation(result);

      return {
        message: () => `Expected ${format(received)} ${this.isNot ? `not ` : ``}to parse as ${format(expected)}, but it parsed as ${format(result)}.`,
        pass: this.equals(result, expected),
      };
    },

    toFailToParse(received, details) {
      let result: any;
      try {
        result = parser.parse(received);
      } catch (e: any) {
        if (this.isNot) {
          return {
            message: () => `Expected ${format(this.actual)} to parse, but it failed with message ${format(e.message)}.`,
            pass: false,
          };
        } else {
          if (typeof details !== `undefined`) {
            if (this.isNot) {
              expect(details).not.toMatchObject(details);
            } else {
              expect(details).toMatchObject(details);
            }
          }
        }

        return {
          message: () => ``,
          pass: true,
        };
      }

      stripLocation(result);

      return {
        message: () => `Expected ${format(this.actual)} to fail to parse${details ? ` with details ${format(details)}` : ``}, but it parsed as ${format(result)}.`,
        pass: false,
      };
    },

    toParseLanguage(received, input, expected, options) {
      const result = received.parse(input, options);

      if (typeof expected !== `undefined`) {
        if (this.isNot) {
          expect(result).not.toEqual(expected);
        } else {
          expect(result).toEqual(expected);
        }
      }

      return {
        message: () => ``,
        pass: true,
      };
    },

    toFailToParseLanguage(received, input, details, options) {
      try {
        received.parse(input, options);
      } catch (e: any) {
        if (this.isNot) {
          return {
            message: () => `Expected ${format(input)} with options ${format(options)} to parse, but it failed with message ${format(e.message)}.`,
            pass: true,
          };
        } else {
          if (typeof details !== `undefined`) {
            if (this.isNot) {
              expect(details).not.toMatchObject(details);
            } else {
              expect(details).toMatchObject(details);
            }
          }
        }
      }

      return {
        message: () => ``,
        pass: true,
      };
    },
  });
});
