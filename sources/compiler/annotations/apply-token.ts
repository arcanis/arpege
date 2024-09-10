import * as asts           from '../asts';
import {CompileAnnotation} from '..';

export function readTokenAnnotation(parameters: Record<string, any>) {
  const {children, ...tokenContext} = parameters;
  return {children, tokenContext};
}

export const applyToken: CompileAnnotation = (ast, node, parameters, options) => {
  if (options.mode !== `tokenizer`)
    return node;

  const {children, tokenContext} = readTokenAnnotation(parameters);
  const stringifiedTokenContext = JSON.stringify(tokenContext);

  const token = children
    ? `token({...${stringifiedTokenContext}, children})`
    : `token(${stringifiedTokenContext})`;

  return {
    type: `action`,
    code: `return ${token}`,
    expression: {
      type: `labeled`,
      label: `children`,
      expression: node,
      location: node.location,
    } as asts.Labeled,
    location: node.location,
  } as asts.Action;
};
