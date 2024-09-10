import {readTokenAnnotation} from '../annotations/apply-token';
import * as asts             from '../asts';
import {visitor}             from '../visitor';
import {CompileOptions}      from '..';

const skipTokens = (expression: asts.Expression): asts.Expression => ({
  type: `action`,
  code: `return []`,
  expression,
  location: expression.location,
});

const makeToken = (expression: asts.Expression): asts.Expression => ({
  type: `action`,
  code: `return token({type: "syntax"})`,
  expression,
  location: expression.location,
});

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
export function prepareTokenizer(ast: asts.Ast, options: CompileOptions) {
  if (options.mode !== `tokenizer`)
    return ast;

  ast.initializer = {
    type: `initializer`,
    code: ``,
    location: ast.location,
  };

  if (options.output === `types`) {
    const leafTokens: Array<string> = [`{type:"syntax"}`];
    const parentTokens: Array<string> = [];

    // We extract all possible token contexts, and use them to generate an array
    // whose type is derived from them.
    visitor.run(ast, {
      visit: (visit, node) => {
        const tokenAnnotation = node.annotations?.find(annotation => {
          return annotation.name === `token`;
        });

        if (tokenAnnotation) {
          const parameters = tokenAnnotation.parameters;
          const {children, tokenContext} = readTokenAnnotation(parameters);

          if (children) {
            parentTokens.push(JSON.stringify({...tokenContext}));
          } else {
            leafTokens.push(JSON.stringify({...tokenContext}));
          }
        }

        return visit(node);
      },
    });

    ast.initializer.code += `
      type CommonTokenProps = {raw: string, location: ReturnType<typeof location>};
      type LeafToken = (${leafTokens.join(` | `) || `never`}) & CommonTokenProps;
      type ParentToken = (${parentTokens.join(` | `) || `never`}) & CommonTokenProps & {children: Array<ParseToken>};

      export type ParseToken = LeafToken | ParentToken;
    `;
  }

  ast.initializer.code += `
    function clean(tokens: any): ParseToken[] {
      return [tokens].flat(Infinity).filter(token => {
        if (token?.children) token.children = clean(token.children);
        return token !== null;
      });
    }

    function token<T extends object>(ctx: T) {
      return {
        type: "syntax",
        raw: text(),
        location: location(),
        ...ctx,
      };
    }
  `;

  ast.result = `
    clean(peg$result)
  `;

  ast = visitor.run(ast, {
    action(visit, node) {
      return {
        ...node,
        type: `group`,
        expression: visit(node.expression),
      };
    },
    labeled(visit, node) {
      return {
        ...node,
        type: `group`,
        expression: visit(node.expression),
      };
    },
  });

  return visitor.run(ast, {
    class(visit, node) {
      return makeToken(node);
    },
    literal(visit, node) {
      return makeToken(node);
    },
    text(visit, node) {
      return makeToken(node);
    },
    simpleNot(visit, node) {
      return skipTokens(node);
    },
    simpleAnd(visit, node) {
      return skipTokens(node);
    },
  });
}
