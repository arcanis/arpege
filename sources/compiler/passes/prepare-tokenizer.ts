import {readTokenAnnotation} from '../annotations/apply-token';
import * as asts             from '../asts';
import {visitor}             from '../visitor';
import {CompileOptions}      from '..';

const TOKEN_CODE = `
  if (peg$skipTokens)
    return;

  const raw = text();
  if (!raw)
    return;

  peg$tokens.push({
    ...tokenContext,
    raw,
    location: location(),
  });

  onRollback(() => {
    peg$tokens.pop();
  });
`;

const skipTokens = (expression: asts.Expression): asts.Expression => ({
  type: `scope`,
  code: `
    const skipTokens = peg$skipTokens;
    peg$skipTokens = true;
    return () => {
      peg$skipTokens = skipTokens;
    };
  `,
  expression,
  location: expression.location,
});

const makeToken = (expression: asts.Expression): asts.Transform => ({
  type: `transform`,
  code: `peg$pushToken(); return current;`,
  expression,
  location: expression.location,
});

function getTokensInitializer(ast: asts.Ast) {
  const tokenContexts: Array<any> = [
    {type: `syntax`},
  ];

  // We extract all possible token contexts, and use them to generate an array
  // whose type is derived from them.
  visitor.run(ast, {
    visit: (visit, node) => {
      const tokenAnnotation = node.annotations?.find(annotation => {
        return annotation.name === `token`;
      });

      if (tokenAnnotation) {
        const parameters = tokenAnnotation.parameters;
        const {tokenContext} = readTokenAnnotation(parameters);

        tokenContexts.push(tokenContext);
      }

      return visit(node);
    },
  });

  const fakeTokens = tokenContexts.map(tokenContext => {
    return `{...${JSON.stringify({...tokenContext})} as const, raw: "", location: location()},\n`;
  }).join(``);

  return `[\n${fakeTokens}]`;
}

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
export function prepareTokenizer(ast: asts.Ast, options: CompileOptions) {
  if (!options.tokenizer)
    return;

  ast.initializer ??= {
    type: `initializer`,
    code: ``,
    location: ast.location,
  };

  ast.initializer.code += `
    const peg$tokens = ${getTokensInitializer(ast)};

    let peg$skipTokens = false;
    let peg$tokenContext = {type: "syntax"};

    function peg$pushToken(tokenContext = peg$tokenContext) {
      ${TOKEN_CODE}
    }
  `;

  ast.result = `peg$tokens`;

  visitor.run(ast, {
    class(visit, node) {
      return makeToken(node);
    },
    literal(visit, node) {
      return makeToken(node);
    },
    text(visit, node) {
      return makeToken(skipTokens(node));
    },
    simpleNot(visit, node) {
      return skipTokens(node);
    },
    simpleAnd(visit, node) {
      return skipTokens(node);
    },
  });
}
