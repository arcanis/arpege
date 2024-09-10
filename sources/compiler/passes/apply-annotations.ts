import {GrammarError}   from '../../grammar-error';
import * as asts        from '../asts';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

const BUILTIN_ANNOTATIONS = new Set([
  `if`,
]);

export function applyAnnotations(ast: asts.Ast, options: CompileOptions) {
  return visitor.run(ast, {
    type: `replacer`,

    visit: (visit, node) => {
      if (!node.annotations || node.annotations.length === 0)
        return visit(node) ?? node;

      const annotations = node.annotations;
      delete node.annotations;

      let res: asts.Node = node;
      for (let t = annotations.length - 1; t >= 0; --t) {
        const {name, parameters} = annotations[t];
        if (BUILTIN_ANNOTATIONS.has(name))
          continue;

        if (!Object.prototype.hasOwnProperty.call(options.annotations, name)) {
          throw new GrammarError(
            `Annotation "${name}" isn't registered in the current compilation context.`,
            node.location,
          );
        }

        res = options.annotations[name](ast, res, parameters, options);
      }

      return visit(res) ?? res;
    },
  });
}
