import {GrammarError}     from '../grammar-error';

import {Bytecode}         from './passes/generate-bytecode';
import {VisitFn, visitor} from './visitor';

export type Position = {
  offset: number;
  line: number;
  column: number;
};

export type Location = {
  start: Position;
  end: Position;
};

export type Token = {
  location: Location;
  raw: string;
  type?: string;
  modifiers?: Array<string>;
};

export type Annotation = {
  name: string;
  parameters: Record<string, any>;
};

export type NodeBase = {
  annotations?: Array<Annotation>;
  location?: Location;
  tsType?: string;
};

export type Action = NodeBase & {
  type: `action`;
  expression: Expression;
  code: string;
};

export type Any = NodeBase & {
  type: `any`;
};

export type Choice = NodeBase & {
  type: `choice`;
  alternatives: Array<Expression>;
};

export type Class = NodeBase & {
  type: `class`;
  parts: Array<string | [string, string]>;
  inverted: boolean;
  ignoreCase: boolean;
};

export type End = NodeBase & {
  type: `end`;
};

export type Group = NodeBase & {
  type: `group`;
  expression: Expression;
};

export type Initializer = NodeBase & {
  type: `initializer`;
  code: string;
};

export type Literal = NodeBase & {
  type: `literal`;
  value: string;
  ignoreCase: boolean;
};

export type Named = NodeBase & {
  type: `named`;
  name: string;
  expression: Expression;
};

export type RuleRef = NodeBase & {
  type: `ruleRef`;
  name: string;
};

export type Rule = NodeBase & {
  type: `rule`;
  name: string;
  expression: Expression;
  bytecode?: Bytecode;
};

export type Scope = NodeBase & {
  type: `scope`;
  expression: Expression;
  code: string;
};

export type Sequence = NodeBase & {
  type: `sequence`;
  elements: Array<Expression>;
};

export type Transform = NodeBase & {
  type: `transform`;
  code: string;
  expression: Expression;
};

export type Labeled = NodeBase & {
  type: `labeled`;
  label: string | null;
  expression: Expression;
};

export type OneOrMore = NodeBase & {
  type: `oneOrMore`;
  expression: Expression;
};

export type Optional = NodeBase & {
  type: `optional`;
  expression: Expression;
};

export type SimpleAnd = NodeBase & {
  type: `simpleAnd`;
  expression: Expression;
};

export type SimpleNot = NodeBase & {
  type: `simpleNot`;
  expression: Expression;
};

export type SemanticAnd = NodeBase & {
  type: `semanticAnd`;
  code: string;
};

export type SemanticNot = NodeBase & {
  type: `semanticNot`;
  code: string;
};

export type ZeroOrMore = NodeBase & {
  type: `zeroOrMore`;
  expression: Expression;
};

export type Text = NodeBase & {
  type: `text`;
  expression: Expression;
};

export type Ast = NodeBase & {
  type: `grammar`;
  initializer: Initializer | null;
  rules: Array<Rule>;
  consts?: Array<string>;
  code?: string;
  result?: string;
};

export type Expression =
  | Action
  | Any
  | Choice
  | Class
  | End
  | Group
  | Labeled
  | Literal
  | Named
  | OneOrMore
  | Optional
  | RuleRef
  | Scope
  | Sequence
  | SemanticAnd
  | SemanticNot
  | SimpleAnd
  | SimpleNot
  | Text
  | Transform
  | ZeroOrMore;

export type Node =
  | Ast
  | Expression
  | Initializer
  | Rule;

export function node<T extends Node>(node: T) {
  return node;
}

export type NodeWithExpression = Extract<Node, {
  expression: Expression;
}>;

/* AST utilities. */
export function findRule(ast: Ast, name: string) {
  return ast.rules.find(r => {
    return r.name === name;
  });
}

export function indexOfRule(ast: Ast, name: string) {
  return ast.rules.findIndex(r => {
    return r.name === name;
  });
}

export function alwaysConsumesOnSuccess(ast: Ast, node: Node) {
  function consumesTrue() {
    return true;
  }

  function consumesFalse() {
    return false;
  }

  function consumesExpression(visit: VisitFn, node: NodeWithExpression) {
    return visit(node.expression);
  }

  return visitor.run(node, {
    rule: consumesExpression,
    named: consumesExpression,

    choice(visit, node) {
      return node.alternatives.every(alternative => visit(alternative));
    },

    action: consumesExpression,
    scope: consumesExpression,
    transform: consumesExpression,

    sequence(visit, node) {
      return node.elements.some(element => visit(element));
    },

    labeled: consumesExpression,
    text: consumesExpression,
    simpleAnd: consumesFalse,
    simpleNot: consumesFalse,
    optional: consumesFalse,
    zeroOrMore: consumesFalse,
    oneOrMore: consumesExpression,
    group: consumesExpression,
    semanticAnd: consumesFalse,
    semanticNot: consumesFalse,

    ruleRef(visit, node) {
      const targetRule = findRule(ast, node.name);

      if (typeof targetRule === `undefined`) {
        throw new GrammarError(
          `Rule "${node.name}" isn't defined.`,
          node.location,
        );
      }

      return visit(targetRule);
    },

    literal(visit, node) {
      return node.value !== ``;
    },

    class: consumesTrue,
    any: consumesTrue,
  });
}
