import camelCase        from 'lodash/camelCase';
import upperFirst       from 'lodash/upperFirst';

import * as asts        from '../asts';
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
      const camelizedName = `${upperFirst(camelCase(ruleName))}Type`;

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
      ruleParts.push(`type ${getRuleType(ruleName)} = ${type};\n`);
    },

    class(visit, node, context: Context) {
      return `string`;
    },

    literal(visit, node, context: Context) {
      return JSON.stringify(node.value);
    },

    text(visit, node, context: Context) {
      return `string`;
    },

    choice(visit, node, context: Context) {
      return node.alternatives.map(child => visit(child, context)).join(` | `);
    },

    ruleRef(visit, node, context: Context) {
      return getRuleType(node.name);
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
      actionParts.push(`const ${fnName} = (${params.join(`, `)}) => PegJS.contributeActionInference(() => {${node.code}});\n`);

      return `ReturnType<typeof ${fnName}>`;
    },
  });

  const firstRuleType = getRuleType(ast.rules[0].name);

  const parts: Array<string> = [];

  parts.push(`interface PegJSInterface {\n`);
  parts.push(`  contributeActionInference<T>(fn: () => T): T;\n`);
  parts.push(`}\n`);
  parts.push(`\n`);
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
  parts.push(`const PegJS: PegJSInterface = {\n`);
  parts.push(`  contributeActionInference: ((fn: any) => fn()) as PegJSInterface['contributeActionInference'],\n`);
  parts.push(`};\n`);
  parts.push(`\n`);
  parts.push(...actionParts);
  parts.push(`\n`);
  parts.push(...ruleParts);
  parts.push(`\n`);
  parts.push(`declare type ParseResult = {\n`);

  for (const rule of ast.rules) {
    const ruleType = getRuleType(rule.name);
    parts.push(`  ${ruleType}: ${ruleType}\n`);
  }

  parts.push(`};\n`);
  parts.push(`\n`);
  parts.push(`declare function error(message: string, location?: PegJSLocation): never;\n`);
  parts.push(`declare function expected(description: string, location?: PegJSLocation): never;\n`);
  parts.push(`declare function onRollback(fn: () => void): void;\n`);
  parts.push(`declare function location(): PegJSLocation;\n`);
  parts.push(`declare function text(): string;\n`);
  parts.push(`\n`);
  parts.push(`type ParseResult = ParseResults['${firstRuleType}'];\n`);
  parts.push(`declare const parse: (data: string) => ParseResult;\n`);
  parts.push(`\n`);
  parts.push(`export {PegJSLocation, PegJSPosition, ParseResults, ParseResult, parse};\n`);

  ast.code = parts.join(``);
}
