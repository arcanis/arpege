import {asts, parser, VisitFn, visitor} from 'arpege';
import format                           from 'pretty-format';

type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends Array<infer U> ? Array<RecursivePartial<U>> :
    T[P] extends object | undefined ? RecursivePartial<T[P]> :
      T[P];
};

declare global {
  namespace jest {
    interface Matchers<R> {
      toChangeAST(grammar: string, details?: RecursivePartial<asts.Ast>, options?: any): R;
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
    type: `replacer`,

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

beforeAll(() => {
  parser.parse(`_ = _`);
});

beforeEach(() => {
  expect.extend({
    toChangeAST(received, grammar, details, options) {
      options = options !== undefined ? options : {};

      var ast = parser.parse(grammar);
      ast = received(ast, options) ?? ast;

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

    toParseAs(grammar, expected) {
      var ast = parser.parse(grammar);

      if (this.isNot)
        expect(ast).not.toMatchObject(expected);
      else
        expect(ast).toMatchObject(expected);

      return {
        message: () => ``,
        pass: true,
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
