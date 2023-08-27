import camelCase        from 'lodash/camelCase';
import upperFirst       from 'lodash/upperFirst';

import * as asts        from '../asts';
import * as js          from '../js';
import {visitor}        from '../visitor';
import {CompileOptions} from '..';

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
export function generateTypes(ast: asts.Ast, options: CompileOptions) {
  const actionParts: Array<string> = [];
  const ruleParts: Array<string> = [];

  type Context = {
    env: Record<string, string>;
    action: asts.Action | null;
  };

  const ruleTypes = new Map();
  const usedNames = new Set();

  function getRuleType(ruleName: string) {
    let ruleType = ruleTypes.get(ruleName);
    if (typeof ruleType === `undefined`) {
      let camelizedName = `${upperFirst(camelCase(ruleName))}`;
      if (!camelizedName)
        camelizedName = `Unknown`;

      for (let t = 0; !ruleType; t++) {
        const candidateName = t === 0 ? camelizedName : `${camelizedName}${t}`;
        if (!usedNames.has(candidateName)) {
          ruleTypes.set(ruleName, ruleType = candidateName);
          usedNames.add(ruleType);
        }
      }
    }

    return ruleType;
  }

  // We register all rule names so that the order they are
  // referenced in the file doesn't impact their names
  for (const rule of ast.rules)
    getRuleType(rule.name);

  visitor.run(ast, {
    type: `processor`,

    visit(visit, node, context) {
      if (node.tsType) {
        return node.tsType;
      } else {
        return visit(node, context);
      }
    },

    rule(visit, node) {
      const type = visit(node.expression, {
        env: {},
        action: null,
      });

      const ruleName = node.name;
      ruleParts.push(`  export type ${getRuleType(ruleName)} = ${type};\n`);
    },

    class() {
      return `string`;
    },

    any() {
      return `string`;
    },

    literal(visit, node, context: Context) {
      return JSON.stringify(node.value).replace(/[\u007F-\uFFFF]/g, chr => {
        return `\\u${(`0000${chr.charCodeAt(0).toString(16)}`).slice(-4)}`;
      });
    },

    text(visit, node, context: Context) {
      return `string`;
    },

    choice(visit, node, context: Context) {
      return node.alternatives.map(child => visit(child, context)).join(` | `);
    },

    ruleRef(visit, node, context: Context) {
      return `ast.${getRuleType(node.name)}`;
    },

    simpleAnd() {
      return `undefined`;
    },

    simpleNot() {
      return `undefined`;
    },

    semanticAnd() {
      return `undefined`;
    },

    semanticNot() {
      return `undefined`;
    },

    sequence(visit, node, context: Context) {
      if (context.action) {
        for (const child of node.elements)
          visit(child, context);

        // Won't be used anyway
        return `never`;
      } else {
        const labeledElements = node.elements.filter((child): child is asts.Labeled => {
          return child.type === `labeled`;
        });

        const anonymousOutputs = labeledElements.filter(child => {
          return child.label === null;
        });

        if (anonymousOutputs.length === 1) {
          return visit(anonymousOutputs[0].expression, context);
        } else if (anonymousOutputs.length > 0) {
          return `[${anonymousOutputs.map(child => visit(child.expression, context)).join(`, `)}]`;
        } else if (labeledElements.length > 0) {
          return `{${labeledElements.map(child => `${child.label}: ${visit(child.expression, context)}`).join(`, `)}}`;
        } else {
          return `[${node.elements.map(child => visit(child, context)).join(`, `)}]`;
        }
      }
    },

    labeled(visit, node, context: Context) {
      if (node.label)
        context.env[node.label] = visit(node.expression);

      return visit(node.expression, context);
    },

    group(visit, node, context) {
      return `(${visit(node.expression, {
        env: {},
        action: null,
      })})`;
    },

    oneOrMore(visit, node, context) {
      return `Array<${visit(node.expression, context)}>`;
    },

    zeroOrMore(visit, node, context) {
      return `Array<${visit(node.expression, context)}>`;
    },

    optional(visit, node, context) {
      return `(${visit(node.expression, context)} | null)`;
    },

    action(visit, node, context) {
      const newEnv: Record<string, string> = {};
      visit(node.expression, {
        env: newEnv,
        action: node,
      });

      const params = Object.entries(newEnv)
        .map(([name, type]) => `${name}: ${type}`);

      const fnName = `peg$type$action${actionParts.length}`;
      actionParts.push(`const ${fnName} = (${params.join(`, `)}) => {${node.code}};\n`);

      return `ReturnType<typeof ${fnName}>`;
    },
  });

  const firstRuleType = getRuleType(ast.rules[0].name);

  const parts: Array<string> = [];

  parts.push(`/* eslint-disable */\n`);
  parts.push(`\n`);

  const dependencies = Object.entries(options.dependencies);
  if (dependencies.length > 0) {
    for (const [variable, source] of dependencies)
      parts.push(`import ${variable} from "${js.stringEscape(source)}";\n`);

    parts.push(`\n`);
  }

  parts.push(`interface PegJSPosition {\n`);
  parts.push(`  offset: number;\n`);
  parts.push(`  line: number;\n`);
  parts.push(`  column: number;\n`);
  parts.push(`}\n`);
  parts.push(`\n`);
  parts.push(`interface PegJSLocation {\n`);
  parts.push(`  start: PegJSPosition;\n`);
  parts.push(`  end: PegJSPosition;\n`);
  parts.push(`}\n`);
  parts.push(`\n`);
  parts.push(ast.initializer?.code ?? ``);
  parts.push(`\n`);
  parts.push(...actionParts);
  parts.push(`\n`);
  parts.push(`namespace ast {\n`);
  parts.push(...ruleParts);
  parts.push(`};\n`);
  parts.push(`\n`);
  parts.push(`declare type ParseResults = {\n`);

  for (const rule of ast.rules) {
    const ruleType = getRuleType(rule.name);
    parts.push(`  ${ruleType}: ast.${ruleType};\n`);
  }

  parts.push(`};\n`);
  parts.push(`\n`);
  parts.push(`declare function cast<T>(value: any, fn: () => T): T;\n`);
  parts.push(`declare function literal<const T>(val: T): T;\n`);
  parts.push(`declare function tuple<T extends any[]>(val: [...T]): [...T];\n`);
  parts.push(`declare function groupBy<T extends Record<string, any>, TProp extends keyof T>(vals: T[], prop: TProp): {[K in T[TProp]]?: Array<Extract<T, {[_ in TProp]: K}>>};\n`);
  parts.push(`declare function notEmpty<T>(value: T | null | undefined): value is T;\n`);
  parts.push(`declare function error(message: string, location?: PegJSLocation): never;\n`);
  parts.push(`declare function expected(description: string, location?: PegJSLocation): never;\n`);
  parts.push(`declare function onRollback(fn: () => void): void;\n`);
  parts.push(`declare function location(): PegJSLocation;\n`);
  parts.push(`declare function text(): string;\n`);
  parts.push(`\n`);
  parts.push(`type ParseResult = ${ast.result ? `typeof ${ast.result}` : `ast.${firstRuleType}`};\n`);
  parts.push(`declare const parse: (data: string) => ParseResult;\n`);
  parts.push(`\n`);
  parts.push(`export {PegJSLocation, PegJSPosition, ParseResults, ParseResult, ast, parse};\n`);
  parts.push(`\n`);
  parts.push(`// Only meant to make it easier to debug the grammar types\n`);
  parts.push(`declare const val: ParseResult;\n`);
  parts.push(`val;\n`);

  ast.code = parts.join(``);
}
