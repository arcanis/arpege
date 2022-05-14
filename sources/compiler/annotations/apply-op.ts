import {CompileAnnotation} from '..';

import {applyToken}        from './apply-token';

export const applyOp: CompileAnnotation = (ast, node, parameters, options) => {
  return applyToken(ast, node, {type: `operator`}, options);
};
