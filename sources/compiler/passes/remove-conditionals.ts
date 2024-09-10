import {ast}            from '../../lkg-parser.types';
import * as asts        from '../asts';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
export function removeConditionals(ast: asts.Ast, options: CompileOptions) {
  return visitor.run(ast, {
    type: `replacer`,

    choice(visit, node) {
      let childIndex = node.alternatives.length;

      while (--childIndex >= 0) {
        const child = node.alternatives[childIndex];

        const conditions = child.annotations?.filter((annotation: {name: string}): annotation is ast.IfAnnotation => {
          return annotation.name === `if`;
        });

        if (typeof conditions === `undefined`)
          continue;

        if (conditions.some(({parameters: {conditions}}) => !conditions.every(name => options.parameters?.has(name)))) {
          node.alternatives.splice(childIndex, 1);
        }
      }

      return node;
    },
  });
}
