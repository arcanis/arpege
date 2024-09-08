import {ast}            from '../../lkg-parser.types';
import * as asts        from '../asts';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
export function removeIfs(ast: asts.Ast, options: CompileOptions) {
  function replaceRuleRefs(ast: asts.Ast, from: string, to: string) {
    const replace = visitor.build({
      sequence(visit, node) {
        let childIndex = node.elements.length;

        while (--childIndex >= 0) {
          const child = node.elements[childIndex];

          const conditions = child.annotations?.filter((annotation: {name: string}): annotation is ast.IfAnnotation => {
            return annotation.name === `if`;
          });

          if (typeof conditions === `undefined`)
            continue;

          if (!conditions.every(annotation => annotation === 1)) {
            node.elements.splice(childIndex, 1);
          }
        }

        return node;
      },
    });

    replace(ast);
  }

  const indices = [];

  for (const [i, rule] of ast.rules.entries()) {
    if (rule.expression.type === `ruleRef`) {
      replaceRuleRefs(ast, rule.name, rule.expression.name);
      if (!options.allowedStartRules.includes(rule.name)) {
        indices.push(i);
      }
    }
  }

  indices.reverse();

  for (const i of indices) {
    ast.rules.splice(i, 1);
  }
}
