import {applySeparator}           from './annotations/apply-separator';
import {applyToken}               from './annotations/apply-token';
import {applyType}                from './annotations/apply-type';
import * as asts                  from './asts';
import {applyAnnotations}         from './passes/apply-annotations';
import {generateBytecode}         from './passes/generate-bytecode';
import {generateJS}               from './passes/generate-js';
import {generateTypes}            from './passes/generate-types';
import {prepareTokenizer}         from './passes/prepare-tokenizer';
import {removeConditionals}       from './passes/remove-conditionals';
import {removeProxyRules}         from './passes/remove-proxy-rules';
import {reportDuplicateLabels}    from './passes/report-duplicate-labels';
import {reportDuplicateRules}     from './passes/report-duplicate-rules';
import {reportInfiniteRecursion}  from './passes/report-infinite-recursion';
import {reportInfiniteRepetition} from './passes/report-infinite-repetition';
import {reportUndefinedRules}     from './passes/report-undefined-rules';
import {visitor}                  from './visitor';

const saferEval = eval;

export type UntypedParser = {
  parse: (code: string) => any;
};

export type CompileOptions = {
  allowedStartRules: Array<string>;
  annotations: Record<string, CompileAnnotation>;
  cache: boolean;
  dependencies: Record<string, string>;
  exportVar: string | null;
  mode: `parser` | `tokenizer`;
  format: `bare` | `commonjs` | `esm` | `typescript`;
  output: `parser` | `source` | `types`;
  parameters: Set<string>;
  trace: boolean;
};

export const defaultOptions: CompileOptions = {
  allowedStartRules: [],
  annotations: {},
  cache: false,
  dependencies: {},
  exportVar: null,
  mode: `parser`,
  format: `bare`,
  output: `parser`,
  parameters: new Set(),
  trace: false,
};

export type CompileAnnotation = (
  ast: asts.Ast,
  node: asts.Node,
  parameters: Record<string, any>,
  options: CompileOptions
) => asts.Node;

export type CompilePass = (
  ast: asts.Ast,
  options: CompileOptions,
) => void;

export type CompilePipeline =
  Partial<
    Record<
      keyof typeof passes,
      Array<CompilePass>
    >
  >;

const annotations = {
  separator: applySeparator,
  token: applyToken,
  type: applyType,
};

// Note that it's different from `getDefaultPipeline`: each member is a dict
// of all available passes, whereas `getDefaultPipeline` members are arrays
// of passes to apply.
//
const passes = {
  check: {
    reportUndefinedRules,
    reportDuplicateRules,
    reportDuplicateLabels,
    reportInfiniteRecursion,
    reportInfiniteRepetition,
  },
  transform: {
    removeConditionals,
    removeProxyRules,
    applyAnnotations,
    prepareTokenizer,
  },
  generate: {
    generateBytecode,
    generateJS,
    generateTypes,
  },
};

const getDefaultPipeline = () => ({
  check: [
    reportUndefinedRules,
    reportDuplicateRules,
    reportDuplicateLabels,
    reportInfiniteRecursion,
    reportInfiniteRepetition,
  ],
  transform: [
    removeConditionals,
    removeProxyRules,
    prepareTokenizer,
    applyAnnotations,
  ],
  generate: [
    generateBytecode,
    generateJS,
  ],
});

/*
 * Generates a parser from a specified grammar AST. Throws |peg.GrammarError|
 * if the AST contains a semantic error. Note that not all errors are detected
 * during the generation and some may protrude to the generated parser and
 * cause its malfunction.
 */
export function compile(ast: asts.Ast, pipeline: CompilePipeline, userOptions?: Partial<CompileOptions> & {output?: Exclude<CompileOptions[`output`], `parser`> | undefined}): string;
export function compile(ast: asts.Ast, pipeline: CompilePipeline, userOptions: Partial<CompileOptions> & {output: `parser`}): UntypedParser;
export function compile(ast: asts.Ast, pipeline: CompilePipeline, userOptions: Partial<CompileOptions>): string | UntypedParser;
export function compile(ast: asts.Ast, pipeline: CompilePipeline, userOptions: Partial<CompileOptions> = {}) {
  const options = {
    ...defaultOptions,
    allowedStartRules: [ast.rules[0].name],
    ...userOptions,
  };

  options.parameters = new Set([
    ...options.parameters,
  ]);

  options.annotations = {
    ...annotations,
    ...options.annotations,
  };

  if (options.output === `parser`)
    options.format = `bare`;

  if (options.mode === `tokenizer`)
    options.parameters.add(`tokenizer`);

  for (const passes of Object.values(pipeline))
    for (const pass of passes)
      pass(ast, options);

  if (!ast.code)
    throw new Error(`Assertion failed: No code generated.`);

  switch (options.output) {
    case `parser`:
      return saferEval(ast.code);

    default: {
      return ast.code;
    }
  }
}

export const compiler = {
  /**
   * Expression annotations.
   */
  annotations,

  /*
   * Compiler passes.
   *
   * Each pass is a function that is passed the AST. It can perform checks on it
   * or modify it as needed. If the pass encounters a semantic error, it throws
   * |peg.GrammarError|.
   */
  passes,

  /**
   * Compiler passes that must be applied unless modifier by plugins.
   */
  getDefaultPipeline,

  /*
   * AST node visitor builder. Useful mainly for plugins which manipulate the
   * AST.
   */
  visitor,

  compile,
};
