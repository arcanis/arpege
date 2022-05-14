import {GrammarError}   from '../../grammar-error';
import * as asts        from '../asts';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

export function applyAnnotations(ast: asts.Ast, options: CompileOptions) {
  visitor.run(ast, {
    visit: (visit, node) => {
      if (!node.annotations || node.annotations.length === 0)
        return visit(node);

      const annotations = node.annotations;

      let res: asts.Node = node;
      for (let t = annotations.length - 1; t >= 0; --t) {
        const {name, parameters} = annotations[t];
        if (!Object.prototype.hasOwnProperty.call(options.annotations, name)) {
          throw new GrammarError(
            `Annotation "${name}" isn't registered in the current compilation context.`,
            node.location,
          );
        }

        res = options.annotations[name](ast, node, parameters, options);
      }

      return res;
    },
  });
}
