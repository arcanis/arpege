import * as asts           from '../asts';
import {CompileAnnotation} from '..';

const setTokenContext = (expression: asts.Expression, tokenContext: Record<string, any>): asts.Expression => ({
  type: `scope`,
  code: `
    const tokenContext = peg$tokenContext;
    peg$tokenContext = ${JSON.stringify(tokenContext)};
    return () => {
      peg$tokenContext = tokenContext;
    };
  `,
  expression,
  location: expression.location,
});

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

const makeToken = (expression: asts.Expression, tokenContext: Record<string, any>): asts.Expression => ({
  type: `transform`,
  code: `peg$pushToken(${JSON.stringify(tokenContext)}); return current;`,
  expression: skipTokens(expression),
  location: expression.location,
});

export function readTokenAnnotation(parameters: Record<string, any>) {
  const {allowNestedTokens, ...tokenContext} = parameters;
  return {allowNestedTokens, tokenContext};
}

export const applyToken: CompileAnnotation = (ast, node, parameters, options) => {
  if (!options.tokenizer)
    return node;

  const {allowNestedTokens, tokenContext} = readTokenAnnotation(parameters);
  if (allowNestedTokens) {
    return setTokenContext(node as any, tokenContext);
  } else {
    return makeToken(node as any, tokenContext);
  }
};
