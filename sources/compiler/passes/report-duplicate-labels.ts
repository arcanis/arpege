import {GrammarError}     from '../../grammar-error';
import * as asts          from '../asts';
import {VisitFn, visitor} from '../visitor';

/* Checks that each label is defined only once within each scope. */
export function reportDuplicateLabels(ast: asts.Ast) {
  function checkExpressionWithClonedEnv(visit: VisitFn, node: asts.NodeWithExpression, env: Record<string, asts.Location>) {
    check(node.expression, {...env});
  }

  const check = visitor.build({
    rule(visit, node) {
      check(node.expression, {});
    },

    choice(visit, node, env) {
      for (const alternative of node.alternatives) {
        check(alternative, {...env});
      }
    },

    action: checkExpressionWithClonedEnv,

    labeled(visit, node, env: Record<string, asts.Location | null>) {
      if (Object.prototype.hasOwnProperty.call(env, node.label)) {
        throw new GrammarError(
          `Label "${node.label}" is already defined${env[node.label] ? ` at line ${env[node.label]!.start.line}, column ${env[node.label]!.start.column}` : ``}.`,
          node.location,
        );
      }

      check(node.expression, env);

      env[node.label] = node.location ?? null;
    },

    text: checkExpressionWithClonedEnv,
    simpleAnd: checkExpressionWithClonedEnv,
    simpleNot: checkExpressionWithClonedEnv,
    optional: checkExpressionWithClonedEnv,
    zeroOrMore: checkExpressionWithClonedEnv,
    oneOrMore: checkExpressionWithClonedEnv,
    group: checkExpressionWithClonedEnv,
  });

  check(ast);
}
