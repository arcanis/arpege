import {GrammarError} from '../grammar-error';

import {Bytecode}     from './passes/generate-bytecode';
import {visitor}      from './visitor';

export type Position = {
  offset: number;
  line: number;
  column: number;
};

export type Location = {
  start: Position;
  end: Position;
};

export type Action = {
  type: `action`;
  expression: Expression;
  code: string;
  location: Location;
};

export type Any = {
  type: `any`;
  location: Location;
};

export type Choice = {
  type: `choice`;
  alternatives: Array<Expression>;
  location: Location;
};

export type Class = {
  type: `class`;
  parts: Array<string | [string, string]>;
  inverted: boolean;
  ignoreCase: boolean;
  location: Location;
};

export type Group = {
  type: `group`;
  expression: Expression;
  location: Location;
};

export type Initializer = {
  type: `initializer`;
  code: string;
  location: Location;
};

export type Literal = {
  type: `literal`;
  value: string;
  ignoreCase: boolean;
  location: Location;
};

export type Named = {
  type: `named`;
  name: string;
  expression: Expression;
  location: Location;
};

export type RuleRef = {
  type: `ruleRef`;
  name: string;
  location: Location;
};

export type Rule = {
  type: `rule`;
  name: string;
  expression: Expression;
  bytecode?: Bytecode;
  location: Location;
};

export type Sequence = {
  type: `sequence`;
  elements: Array<Expression>;
  location: Location;
};

export type Labeled = {
  type: `labeled`;
  label: string;
  expression: Expression;
  location: Location;
};

export type OneOrMore = {
  type: `oneOrMore`;
  expression: Expression;
  location: Location;
};

export type Optional = {
  type: `optional`;
  expression: Expression;
  location: Location;
};

export type SimpleAnd = {
  type: `simpleAnd`;
  expression: Expression;
  location: Location;
};

export type SimpleNot = {
  type: `simpleNot`;
  expression: Expression;
  location: Location;
};

export type SemanticAnd = {
  type: `semanticAnd`;
  code: string;
  location: Location;
};

export type SemanticNot = {
  type: `semanticNot`;
  code: string;
  location: Location;
};

export type ZeroOrMore = {
  type: `zeroOrMore`;
  expression: Expression;
  location: Location;
};

export type Text = {
  type: `text`;
  expression: Expression;
  location: Location;
};

export type Ast = {
  type: `grammar`;
  initializer: Initializer | null;
  rules: Array<Rule>;
  consts?: Array<string>;
  code?: string;
  location: Location;
};

export type Expression =
  | Action
  | Any
  | Choice
  | Class
  | Group
  | Labeled
  | Literal
  | Named
  | OneOrMore
  | Optional
  | RuleRef
  | Sequence
  | SemanticAnd
  | SemanticNot
  | SimpleAnd
  | SimpleNot
  | Text
  | ZeroOrMore;

export type Node =
  | Ast
  | Expression
  | Initializer
  | Rule;

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
  function consumesTrue()  {
    return true;
  }
  function consumesFalse() {
    return false;
  }

  function consumesExpression(node: NodeWithExpression) {
    return consumes(node.expression);
  }

  const consumes = visitor.build({
    rule: consumesExpression,
    named: consumesExpression,

    choice(node) {
      return node.alternatives.every(alternative => consumes(alternative));
    },

    action: consumesExpression,

    sequence(node) {
      return node.elements.some(element => consumes(element));
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

    ruleRef(node) {
      const targetRule = findRule(ast, node.name);

      if (typeof targetRule === `undefined`) {
        throw new GrammarError(
          `Rule "${node.name}" isn't defined.`,
          node.location,
        );
      }

      return consumes(targetRule);
    },

    literal(node) {
      return node.value !== ``;
    },

    class: consumesTrue,
    any: consumesTrue,
  });

  return consumes(node);
}
