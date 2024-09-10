import * as asts        from '../asts';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
export function removeProxyRules(ast: asts.Ast, options: CompileOptions) {
  function replaceRuleRefs(ast: asts.Ast, from: string, to: string) {
    return visitor.run(ast, {
      type: `replacer`,

      ruleRef(visit, node) {
        if (node.name === from) {
          return {...node, name: to};
        } else {
          return node;
        }
      },
    });
  }

  const replacements: Array<[string, string]> = [];
  const fixedRules: Array<asts.Rule> = [];

  for (const rule of ast.rules) {
    if (rule.expression.type === `ruleRef`) {
      replacements.push([rule.name, rule.expression.name]);
      if (options.allowedStartRules.includes(rule.name)) {
        fixedRules.push(rule);
      }
    } else {
      fixedRules.push(rule);
    }
  }

  ast = {...ast, rules: fixedRules};

  for (const [from, to] of replacements)
    ast = replaceRuleRefs(ast, from, to);

  return ast;
}
