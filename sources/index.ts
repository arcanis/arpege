import * as asts                                   from './compiler/asts';
import {VisitFn, visitor}                          from './compiler/visitor';
import {CompileOptions, CompilePipeline, compiler} from './compiler';
import {GrammarError}                              from './grammar-error';
import parser                                      from './grammar.pegjs';

/* PEG.js version (uses semantic versioning). */
export const VERSION = `0.10.0`;

export {GrammarError, VisitFn, asts, compiler, parser, visitor};

export type GenerateOptions = CompileOptions & {
  parser: any;
  plugins: Array<Plugin>;
};

export type PegPluginContext = {
  parser: typeof parser;
  passes: CompilePipeline;
};

export interface Plugin {
  use(
    context: PegPluginContext,
    options: Partial<GenerateOptions>,
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
export function generate(grammar: string, options: Partial<GenerateOptions> = {}): any {
  const config: PegPluginContext = {
    parser: options.parser ?? parser,
    passes: compiler.getDefaultPipeline(),
  };

  if (options.output === `types`) {
    config.passes.transform = config.passes.transform?.filter(pass => pass !== compiler.passes.transform.removeProxyRules);
    config.passes.generate = [compiler.passes.generate.generateTypes];
  }

  for (const p of options.plugins ?? [])
    p.use(config, options);

  return compiler.compile(
    config.parser.parse(grammar) as asts.Ast,
    config.passes,
    options,
  );
}
