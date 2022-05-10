import * as asts from './asts';

export type VisitFn = (
  node: asts.Node,
  ...extraArgs: Array<any>
) => any;

type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T];

const getDefaultVisitorFunctions = (visit: VisitFn) => {
  function createVisitNop<T>() {
    return function noop(node: T, ...extraArgs: Array<any>): any {};
  }

  function createVisitExpression<T extends asts.NodeWithExpression>() {
    return function visitExpression(node: T, ...extraArgs: Array<any>): any {
      visit(node.expression, ...extraArgs);
    };
  }

  function createVisitChildren<T extends asts.Node>() {
    return <K extends KeysMatching<T, Array<asts.Node>>>(property: K) => {
      return function visitChildren(node: T, ...extraArgs: Array<any>): any {
        for (const child of (node as any)[property]) {
          visit(child, ...extraArgs);
        }
      };
    };
  }

  return {
    grammar: function visitGrammar(node: asts.Ast, ...extraArgs: Array<any>) {
      if (node.initializer)
        visit(node.initializer, ...extraArgs);

      for (const rule of node.rules) {
        visit(rule, ...extraArgs);
      }
    },

    initializer: createVisitNop<asts.Initializer>(),
    rule: createVisitExpression<asts.Rule>(),
    named: createVisitExpression<asts.Named>(),
    choice: createVisitChildren<asts.Choice>()(`alternatives`),
    action: createVisitExpression<asts.Action>(),
    sequence: createVisitChildren<asts.Sequence>()(`elements`),
    labeled: createVisitExpression<asts.Labeled>(),
    text: createVisitExpression<asts.Text>(),
    simpleAnd: createVisitExpression<asts.SimpleAnd>(),
    simpleNot: createVisitExpression<asts.SimpleNot>(),
    optional: createVisitExpression<asts.Optional>(),
    zeroOrMore: createVisitExpression<asts.ZeroOrMore>(),
    oneOrMore: createVisitExpression<asts.OneOrMore>(),
    group: createVisitExpression<asts.Group>(),
    semanticAnd: createVisitNop<asts.SemanticAnd>(),
    semanticNot: createVisitNop<asts.SemanticNot>(),
    ruleRef: createVisitNop<asts.RuleRef>(),
    literal: createVisitNop<asts.Literal>(),
    class: createVisitNop<asts.Class>(),
    any: createVisitNop<asts.Any>(),
  };
};

export type Visitor = ReturnType<typeof getDefaultVisitorFunctions>;

/* Simple AST node visitor builder. */
export const visitor = {
  build(userFunctions: Partial<Visitor>) {
    function visit(node: asts.Node, ...extraArgs: Array<any>) {
      return functions[node.type](node as any, ...extraArgs);
    }

    const functions = {
      ...getDefaultVisitorFunctions(visit),
      ...userFunctions,
    };

    return visit;
  },
};
