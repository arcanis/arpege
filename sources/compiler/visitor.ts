import * as asts from './asts';

export type VisitFn = (
  node: asts.Node,
  ...extraArgs: Array<any>
) => any;

type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T];

function createVisitNop<T>() {
  return function noop(visit: VisitFn, node: T, ...extraArgs: Array<any>): any {
    return node;
  };
}

function createVisitExpression<T extends asts.NodeWithExpression>() {
  return function visitExpression(visit: VisitFn, node: T, ...extraArgs: Array<any>): any {
    const res = visit(node.expression, ...extraArgs);

    if (typeof res !== `undefined`)
      node.expression = res;

    return node;
  };
}

function createVisitChildren<T extends asts.Node>() {
  return <K extends KeysMatching<T, Array<asts.Node>>>(property: K) => {
    return function visitChildren(visit: VisitFn, node: T, ...extraArgs: Array<any>): any {
      const children: Array<asts.Node> = (node as any)[property];
      const result: Array<asts.Node> = (node as any)[property] = [];

      for (const child of children) {
        const res = visit(child, ...extraArgs);
        if (res === null)
          continue;

        result.push(res ?? child);
      }

      return node;
    };
  };
}

function visitGrammar(visit: VisitFn, node: asts.Ast, ...extraArgs: Array<any>) {
  if (node.initializer)
    visit(node.initializer, ...extraArgs);

  for (const rule of node.rules) {
    visit(rule, ...extraArgs);
  }
}

const defaultVisitorFunctions = {
  grammar: visitGrammar,
  initializer: createVisitNop<asts.Initializer>(),
  rule: createVisitExpression<asts.Rule>(),
  named: createVisitExpression<asts.Named>(),
  choice: createVisitChildren<asts.Choice>()(`alternatives`),
  action: createVisitExpression<asts.Action>(),
  scope: createVisitExpression<asts.Scope>(),
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
  transform: createVisitExpression<asts.Transform>(),
  literal: createVisitNop<asts.Literal>(),
  class: createVisitNop<asts.Class>(),
  any: createVisitNop<asts.Any>(),
};

export type Visitor = typeof defaultVisitorFunctions;
export type UserVisitor = Partial<Visitor> & {visit?: (visit: VisitFn, node: asts.Node, ...extraArgs: Array<any>) => any};

/* Simple AST node visitor builder. */
export const visitor = {
  build(userFunctions: UserVisitor) {
    const effectiveVisit = typeof userFunctions.visit !== `undefined`
      ? userFunctions.visit.bind(null, visitNode)
      : visitNode;

    function visitNode(node: asts.Node, ...extraArgs: Array<any>): any {
      return functions[node.type](effectiveVisit, node as any, ...extraArgs);
    }

    const functions = {
      ...defaultVisitorFunctions,
      visit: visitNode,
      ...userFunctions,
    };

    return effectiveVisit;
  },

  run(ast: asts.Node, userFunctions: UserVisitor) {
    const visit = visitor.build(userFunctions);
    return visit(ast);
  },
};
