import {GrammarError} from '../../grammar-error';
import * as asts      from '../asts';
import {visitor}      from '../visitor';

/* Checks that all referenced rules exist. */
export function reportUndefinedRules(ast: asts.Ast) {
  visitor.run(ast, {
    ruleRef(visit, node) {
      if (!asts.findRule(ast, node.name)) {
        throw new GrammarError(
          `Rule "${node.name}" is not defined.`,
          node.location,
        );
      }
    },
  });

  return ast;
}
