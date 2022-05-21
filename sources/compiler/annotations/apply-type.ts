import {CompileAnnotation} from '..';

export const applyType: CompileAnnotation = (ast, node, parameters, options) => {
  return {...node, tsType: parameters.type};
};
