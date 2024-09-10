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

    if (typeof res !== `undefined` && res !== node.expression) {
      return {...node, expression: res as any};
    } else {
      return node;
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
    const outChildren: Array<asts.Node> = [];

    for (const child of inChildren) {
      const res = visit(child, ...extraArgs);
      if (res === null)
        continue;

      outChildren.push(res ?? child);
    }

    return {...node, [property]: outChildren};
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

function createGrammarReplacer() {
  return function visitGrammar(visit: VisitFn, node: asts.Ast, ...extraArgs: Array<any>) {
    let initializer = node.initializer;
    if (node.initializer)
      initializer = visit(node.initializer, ...extraArgs);

    const newRules: Array<asts.Rule> = [];
    let rulesChanged = false;

    for (const rule of node.rules) {
      const res = visit(rule, ...extraArgs);
      if (res !== null) {
        newRules.push(res);
        rulesChanged ||= res !== rule;
      }
    }

    if (initializer !== node.initializer || rulesChanged) {
      return {...node, initializer, rules: newRules};
    } else {
      return node;
    }
  };
}

function createGrammarProcessor() {
  return function visitGrammar(visit: VisitFn, node: asts.Ast, ...extraArgs: Array<any>) {
    const initializer = node.initializer
      ? visit(node.initializer, ...extraArgs)
      : null;

    const rules = node.rules.map(rule => {
      return visit(rule, ...extraArgs);
    });

    return {initializer, rules};
  };
}

const getDefaultVisitorFunctions = (opts: {
  createGrammarVisitor: () => (visit: VisitFn, node: asts.Ast, ...extraArgs: Array<any>) => any;
  createLeafVisitor: <T>() => (visit: VisitFn, node: T, ...extraArgs: Array<any>) => any;
  createExpressionVisitor: <T extends asts.NodeWithExpression>() => (visit: VisitFn, node: T, ...extraArgs: Array<any>) => any;
  createChildrenVisitor: <T extends asts.Node>(propertyName: keyof T) => (visit: VisitFn, node: T, ...extraArgs: Array<any>) => any;
}) => ({
  grammar: opts.createGrammarVisitor(),
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
  literal: opts.createLeafVisitor<asts.Literal>(),
  class: opts.createLeafVisitor<asts.Class>(),
  any: opts.createLeafVisitor<asts.Any>(),
  end: opts.createLeafVisitor<asts.End>(),
});

const defaultFunctions = {
  replacer: getDefaultVisitorFunctions({
    createGrammarVisitor: createGrammarReplacer,
    createChildrenVisitor: createChildrenReplacer,
    createExpressionVisitor: createExpressionReplacer,
    createLeafVisitor,
  }),
  processor: getDefaultVisitorFunctions({
    createGrammarVisitor: createGrammarProcessor,
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
