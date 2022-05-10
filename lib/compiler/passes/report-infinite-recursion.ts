import {GrammarError} from '../../grammar-error';
import * as asts      from '../asts';
import {visitor}      from '../visitor';

/*
 * Reports left recursion in the grammar, which prevents infinite recursion in
 * the generated parser.
 *
 * Both direct and indirect recursion is detected. The pass also correctly
 * reports cases like this:
 *
 *   start = "a"? start
 *
 * In general, if a rule reference can be reached without consuming any input,
 * it can lead to left recursion.
 */
export function reportInfiniteRecursion(ast: asts.Ast) {
  const visitedRules = new Set<string>();

  const check = visitor.build({
    rule(node) {
      visitedRules.add(node.name);
      check(node.expression);
      visitedRules.delete(node.name);
    },

    sequence(node) {
      for (const element of node.elements) {
        check(element);

        if (asts.alwaysConsumesOnSuccess(ast, element)) {
          break;
        }
      }
    },

    ruleRef(node) {
      if (visitedRules.has(node.name)) {
        throw new GrammarError(
          `Possible infinite loop when parsing (left recursion: ${[...visitedRules].join(` -> `)}).`,
          node.location,
        );
      }

      const targetRule = asts.findRule(ast, node.name);
      if (typeof targetRule === `undefined`)
        return;

      check(targetRule);
    },
  });

  check(ast);
}
