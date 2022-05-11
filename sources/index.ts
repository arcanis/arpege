import * as asts                                   from './compiler/asts';
import {CompileOptions, CompilePipeline, compiler} from './compiler';
import {GrammarError}                              from './grammar-error';
import parser                                      from './grammar.pegjs';

/* PEG.js version (uses semantic versioning). */
export const VERSION = `0.10.0`;

export {GrammarError, compiler, parser};

export type PegOptions = CompileOptions & {
  plugins: Array<Plugin>;
};

export type PegPluginContext = {
  parser: typeof parser;
  passes: CompilePipeline;
};

export interface Plugin {
  use(
    context: PegPluginContext,
    options: Partial<PegOptions>,
  ): void;
}

/*
  * Generates a parser from a specified grammar and returns it.
  *
  * The grammar must be a string in the format described by the metagramar in
  * the parser.pegjs file.
  *
  * Throws |peg.parser.SyntaxError| if the grammar contains a syntax error or
  * |peg.GrammarError| if it contains a semantic error. Note that not all
  * errors are detected during the generation and some may protrude to the
  * generated parser and cause its malfunction.
  */
export function generate(grammar: string, options: Partial<PegOptions> = {}) {
  const config = {
    parser,
    passes: compiler.defaultPipeline,
  };

  for (const p of options.plugins ?? [])
    p.use(config, options);

  return compiler.compile(
    config.parser.parse(grammar) as asts.Ast,
    config.passes,
    options,
  );
}
