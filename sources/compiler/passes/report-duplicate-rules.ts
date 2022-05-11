import {GrammarError} from '../../grammar-error';
import * as asts      from '../asts';
import {visitor}      from '../visitor';

/* Checks that each rule is defined only once. */
export function reportDuplicateRules(ast: asts.Ast) {
  const rules = new Map<string, asts.Location>();

  const check = visitor.build({
    rule(node) {
      const priorDefinition = rules.get(node.name);

      if (typeof priorDefinition !== `undefined`) {
        throw new GrammarError(
          `Rule "${node.name}" is already defined at line ${priorDefinition.start.line}, column ${priorDefinition.start.column}.`,
          node.location,
        );
      }

      rules.set(node.name, node.location);
    },
  });

  check(ast);
}
