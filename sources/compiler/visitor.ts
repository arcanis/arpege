import * as asts from './asts';

export type VisitFn = (
  node: asts.Node,
  ...extraArgs: Array<any>
) => any;

function createLeafVisitor<T>() {
  return function leaf(visit: VisitFn, node: T, ...extraArgs: Array<any>): any {
    return node;
  };
}

function createExpressionReplacer<T extends asts.NodeWithExpression>() {
  return function visitExpression(visit: VisitFn, node: T, ...extraArgs: Array<any>): any {
    const res = visit(node.expression, ...extraArgs);

    if (typeof res !== `undefined`) {
      node.expression = res as any;
    }
  };
}

function createExpressionProcessor<T extends asts.NodeWithExpression>() {
  return function visitExpression(visit: VisitFn, node: T, ...extraArgs: Array<any>): any {
    return visit(node.expression, ...extraArgs);
  };
}

function createChildrenReplacer<T extends asts.Node>(property: keyof T) {
  return function visitChildren(visit: VisitFn, node: T, ...extraArgs: Array<any>): any {
    const inChildren: Array<asts.Node> = (node as any)[property];
    const outChildren: Array<asts.Node> = (node as any)[property] = [];

    for (const child of inChildren) {
      const res = visit(child, ...extraArgs);
      if (res === null)
        continue;

      outChildren.push(res ?? child);
    }
  };
}

function createChildrenProcessor<T extends asts.Node>(property: keyof T) {
  return function visitChildren(visit: VisitFn, node: T, ...extraArgs: Array<any>): any {
    const values: Array<any> = [];

    for (const child of (node as any)[property])
      values.push(visit(child, ...extraArgs));

    return values;
  };
}

function visitGrammar(visit: VisitFn, node: asts.Ast, ...extraArgs: Array<any>) {
  if (node.initializer)
    visit(node.initializer, ...extraArgs);

  for (const rule of node.rules) {
    visit(rule, ...extraArgs);
  }
}

const getDefaultVisitorFunctions = (opts: {
  createLeafVisitor: <T>() => (visit: VisitFn, node: T, ...extraArgs: Array<any>) => any;
  createExpressionVisitor: <T extends asts.NodeWithExpression>() => (visit: VisitFn, node: T, ...extraArgs: Array<any>) => any;
  createChildrenVisitor: <T extends asts.Node>(propertyName: keyof T) => (visit: VisitFn, node: T, ...extraArgs: Array<any>) => any;
}) => ({
  grammar: visitGrammar,
  initializer: opts.createLeafVisitor<asts.Initializer>(),
  rule: opts.createExpressionVisitor<asts.Rule>(),
  named: opts.createExpressionVisitor<asts.Named>(),
  choice: opts.createChildrenVisitor<asts.Choice>(`alternatives`),
  action: opts.createExpressionVisitor<asts.Action>(),
  scope: opts.createExpressionVisitor<asts.Scope>(),
  sequence: opts.createChildrenVisitor<asts.Sequence>(`elements`),
  labeled: opts.createExpressionVisitor<asts.Labeled>(),
  text: opts.createExpressionVisitor<asts.Text>(),
  simpleAnd: opts.createExpressionVisitor<asts.SimpleAnd>(),
  simpleNot: opts.createExpressionVisitor<asts.SimpleNot>(),
  optional: opts.createExpressionVisitor<asts.Optional>(),
  zeroOrMore: opts.createExpressionVisitor<asts.ZeroOrMore>(),
  oneOrMore: opts.createExpressionVisitor<asts.OneOrMore>(),
  group: opts.createExpressionVisitor<asts.Group>(),
  semanticAnd: opts.createLeafVisitor<asts.SemanticAnd>(),
  semanticNot: opts.createLeafVisitor<asts.SemanticNot>(),
  ruleRef: opts.createLeafVisitor<asts.RuleRef>(),
  transform: opts.createExpressionVisitor<asts.Transform>(),
  literal: opts.createLeafVisitor<asts.Literal>(),
  class: opts.createLeafVisitor<asts.Class>(),
  any: opts.createLeafVisitor<asts.Any>(),
  end: opts.createLeafVisitor<asts.End>(),
});

const defaultFunctions = {
  replacer: getDefaultVisitorFunctions({
    createChildrenVisitor: createChildrenReplacer,
    createExpressionVisitor: createExpressionReplacer,
    createLeafVisitor,
  }),
  processor: getDefaultVisitorFunctions({
    createChildrenVisitor: createChildrenProcessor,
    createExpressionVisitor: createExpressionProcessor,
    createLeafVisitor,
  }),
};

export type Visitor = ReturnType<typeof getDefaultVisitorFunctions>;

export type UserVisitor = Partial<Visitor> & {
  type?: keyof typeof defaultFunctions;
  visit?: (visit: VisitFn, node: asts.Node, ...extraArgs: Array<any>) => any;
};

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
      ...defaultFunctions[userFunctions.type ?? `replacer`],
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
