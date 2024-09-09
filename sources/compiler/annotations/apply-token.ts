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

const extractChildTokens = (expression: asts.Expression): asts.Expression => ({
  type: `scope`,
  code: `
    const tokens = peg$tokens;
    peg$tokens = [];

    return () => {
      const finalToken = peg$tokens.pop();
      if (finalToken)
        finalToken.children = peg$tokens;

      peg$tokens = tokens;
      if (finalToken) {
        peg$tokens.push(finalToken);
      }
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

const makeParentToken = (expression: asts.Expression, tokenContext: Record<string, any>): asts.Expression => extractChildTokens({
  type: `transform`,
  code: `peg$pushToken(${JSON.stringify(tokenContext)}); return current;`,
  expression,
  location: expression.location,
});

export function readTokenAnnotation(parameters: Record<string, any>) {
  const {children, ...tokenContext} = parameters;
  return {children, tokenContext};
}

export const applyToken: CompileAnnotation = (ast, node, parameters, options) => {
  if (options.mode !== `tokenizer`)
    return node;

  const {children, tokenContext} = readTokenAnnotation(parameters);
  if (children) {
    return makeParentToken(node as any, tokenContext);
  } else {
    return makeToken(node as any, tokenContext);
  }
};

export const applyContextToken: CompileAnnotation = (ast, node, parameters, options) => {
  const {tokenContext} = readTokenAnnotation(parameters);

  return setTokenContext(node as any, tokenContext);
};
