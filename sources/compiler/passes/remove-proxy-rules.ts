import * as asts        from '../asts';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
export function removeProxyRules(ast: asts.Ast, options: CompileOptions) {
  function replaceRuleRefs(ast: asts.Ast, from: string, to: string) {
    const replace = visitor.build({
      ruleRef(visit, node) {
        if (node.name === from) {
          node.name = to;
        }
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
