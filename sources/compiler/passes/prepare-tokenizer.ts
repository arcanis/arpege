import * as asts        from '../asts';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

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

const makeToken = (expression: asts.Expression): asts.Transform => ({
  type: `transform`,
  code: `peg$pushToken(); return current;`,
  expression,
  location: expression.location,
});

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
    const peg$tokens = [];

    let peg$skipTokens = false;
    let peg$tokenContext = {type: "syntax"};

    function peg$pushToken(tokenContext = peg$tokenContext) {
      ${TOKEN_CODE}
    }

    transforms = [() => peg$tokens];
  `;

  visitor.run(ast, {
    class(visit, node) {
      return makeToken(node);
    },
    literal(visit, node) {
      return makeToken(node);
    },
    text(visit, node) {
      return makeToken(node);
    },
  });
}
