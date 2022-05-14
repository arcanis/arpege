import {applyOp}                  from './annotations/apply-op';
import {applySeparator}           from './annotations/apply-separator';
import {applyToken}               from './annotations/apply-token';
import * as asts                  from './asts';
import {applyAnnotations}         from './passes/apply-annotations';
import {generateBytecode}         from './passes/generate-bytecode';
import {generateJS}               from './passes/generate-js';
import {prepareTokenizer}         from './passes/prepare-tokenizer';
import {removeProxyRules}         from './passes/remove-proxy-rules';
import {reportDuplicateLabels}    from './passes/report-duplicate-labels';
import {reportDuplicateRules}     from './passes/report-duplicate-rules';
import {reportInfiniteRecursion}  from './passes/report-infinite-recursion';
import {reportInfiniteRepetition} from './passes/report-infinite-repetition';
import {reportUndefinedRules}     from './passes/report-undefined-rules';
import {visitor}                  from './visitor';

const saferEval = eval;

export type CompileOptions = {
  allowedStartRules: Array<string>;
  annotations: Record<string, CompileAnnotation>;
  cache: boolean;
  dependencies: Record<string, string>;
  exportVar: string | null;
  format: `amd` | `bare` | `commonjs` | `globals` | `umd`;
  optimize: `speed` | `size`;
  output: `parser` | `source`;
  tokenizer: boolean;
  trace: boolean;
};

export const defaultOptions: CompileOptions = {
  allowedStartRules: [],
  annotations: {},
  cache: false,
  dependencies: {},
  exportVar: null,
  format: `bare`,
  optimize: `speed`,
  output: `parser`,
  tokenizer: false,
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
  op: applyOp,
  separator: applySeparator,
  token: applyToken,
};

const passes = {
  check: {
    reportUndefinedRules,
    reportDuplicateRules,
    reportDuplicateLabels,
    reportInfiniteRecursion,
    reportInfiniteRepetition,
  },
  transform: {
    prepareTokenizer,
    removeProxyRules,
    applyAnnotations,
  },
  generate: {
    generateBytecode,
    generateJS,
  },
};

const defaultPipeline = {
  check: [
    reportUndefinedRules,
    reportDuplicateRules,
    reportDuplicateLabels,
    reportInfiniteRecursion,
    reportInfiniteRepetition,
  ],
  transform: [
    prepareTokenizer,
    removeProxyRules,
    applyAnnotations,
  ],
  generate: [
    generateBytecode,
    generateJS,
  ],
};

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
  defaultPipeline,

  /*
   * AST node visitor builder. Useful mainly for plugins which manipulate the
   * AST.
   */
  visitor,

  /*
   * Generates a parser from a specified grammar AST. Throws |peg.GrammarError|
   * if the AST contains a semantic error. Note that not all errors are detected
   * during the generation and some may protrude to the generated parser and
   * cause its malfunction.
   */
  compile(ast: asts.Ast, pipeline: CompilePipeline, userOptions: Partial<CompileOptions> = {}) {
    const options = {
      ...defaultOptions,
      allowedStartRules: [ast.rules[0].name],
      ...userOptions,
    };

    options.annotations = {
      ...annotations,
      ...options.annotations,
    };

    if (options.output === `parser`)
      options.format = `bare`;

    for (const passes of Object.values(pipeline))
      for (const pass of passes)
        pass(ast, options);

    switch (options.output) {
      case `parser`: return saferEval(ast.code!);
      case `source`: return ast.code;
      default: throw new Error(`Assertion failed: Invalid output type`);
    }
  },
};
