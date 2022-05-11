import * as asts        from '../asts';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
export function prepareTokenizer(ast: asts.Ast, options: CompileOptions) {
  if (!options.tokenizer)
    return;

  function wrapWithAction(token: string, expression: asts.Expression): asts.Action {
    return {
      type: `action`,
      code: `return {type: ${JSON.stringify(token)}, raw: text(), location: location()}`,
      expression: {...expression},
      location: expression.location,
    };
  }

  visitor.run(ast, visit => ({
    action(node) {
      Object.assign(node, node.expression);
      visit(node.expression);
    },
    text(node) {
      Object.assign(node, {type: `group`});
      visit(node);
    },
    labeled(node) {
      Object.assign(node, node.expression);
      visit(node);
    },
  }));

  visitor.run(ast, () => ({
    named(node) {
      node.expression = wrapWithAction(node.name, node.expression);
    },
    literal(node) {
      Object.assign(node, wrapWithAction(`syntax`, node));
    },
    optional(node) {
      Object.assign(node, {
        type: `action`,
        code: `return val ?? []`,
        expression: {
          type: `labeled`,
          label: `val`,
          expression: {...node},
        },
      });
    },
  }));
}
