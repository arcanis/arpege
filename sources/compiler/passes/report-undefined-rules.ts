import {GrammarError} from '../../grammar-error';
import * as asts      from '../asts';
import {visitor}      from '../visitor';

/* Checks that all referenced rules exist. */
export function reportUndefinedRules(ast: asts.Ast) {
  const check = visitor.build({
    ruleRef(visit, node) {
      if (!asts.findRule(ast, node.name)) {
        throw new GrammarError(
          `Rule "${node.name}" is not defined.`,
          node.location,
        );
      }
    },
  });

  check(ast);
}
