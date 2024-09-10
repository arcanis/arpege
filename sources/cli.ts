import {Command, Option, runExit, UsageError} from 'clipanion';
import fs                                     from 'fs';
import path                                   from 'path';
import * as prettier                          from 'prettier';
import * as t                                 from 'typanion';
import util                                   from 'util';

import {CompileOptions}                       from './compiler';
import {generate}                             from './index';

const isMode = t.isEnum([`parser`, `tokenizer`] as const);
const isFormat = t.isEnum([`bare`, `commonjs`, `esm`] as const);

abstract class BasePegCommand extends Command {
  writeJson(data: any) {
    const pretty = process.stdout.isTTY
      ? util.inspect(data, {depth: Infinity, colors: true})
      : JSON.stringify(data, null, 2);

    this.context.stdout.write(`${pretty}\n`);
  }

  async catch(err: any) {
    if (err.name === `PegSyntaxError`) {
      throw new UsageError(err.message);
    } else {
      throw err;
    }
  }
}

runExit({
  binaryName: `peg`,
  binaryLabel: `Arpege CLI`,
}, [
  class GeneratePegCommand extends BasePegCommand {
    modes = Option.Array(`--mode`, [], {
      validator: t.isArray(isMode),
    });

    formats = Option.Array(`--format`, [], {
      validator: t.isArray(isFormat),
    });

    output = Option.String(`-o,--output`, {
      tolerateBoolean: true,
    });

    /** @deprecated */
    tokenizer = Option.Boolean(`--tokenizer`, false, {
      hidden: true,
    });

    parameters = Option.Array(`--enable`, []);

    withCache = Option.Boolean(`--with-cache`, false);
    withTypes = Option.Boolean(`--with-types`, false);

    file = Option.String();

    async execute() {
      if (this.tokenizer && !this.modes.includes(`tokenizer`))
        this.modes.push(`tokenizer`);

      const source = await fs.promises.readFile(this.file, `utf8`);

      const formats: typeof this.formats = this.formats.length === 0
        ? [`esm`]
        : this.formats;

      const modes: typeof this.modes = this.modes.length === 0
        ? [`parser`]
        : this.modes;

      for (const mode of modes) {
        for (const format of formats) {
          const ext = ({
            bare: `.js`,
            commonjs: `.cjs`,
            esm: `.mjs`,
            typescript: `.mjs`,
          } satisfies Record<CompileOptions[`format`], string>)[format];

          const output = this.output
            ? this.output === true
              ? `${this.file.replace(/\.peg(js)?$/, ``)}.${mode}${ext}`
              : this.output
            : null;

          const parameters = new Set(this.parameters);

          if (!this.withTypes || output) {
            const code = generate(source, {cache: this.withCache, parameters, mode, output: `source`, format});

            if (output) {
              await fs.promises.writeFile(output, await prettier.format(code, {parser: `acorn`}));
            } else {
              this.context.stdout.write(code);
            }
          }

          if (this.withTypes) {
            const code = generate(source, {parameters, mode, output: `types`, format});

            if (output) {
              const basePath = output.replace(/\.[mc]?js$/, ``);
              const typesName = `${basePath}.types.ts`;

              await fs.promises.writeFile(
                typesName,
                await prettier.format(code, {parser: `typescript`}),
              );

              await fs.promises.writeFile(
                `${basePath}.d.ts`.replace(/\.js\.d\.ts$/, `.d.ts`),
                `export * from './${path.basename(typesName)}';\n`,
              );
            } else {
              this.context.stdout.write(code);
              return;
            }
          }
        }
      }
    }
  },

  class ProcessFileCommand extends BasePegCommand {
    mode = Option.String(`--mode`, `parser`, {
      validator: isMode,
    });

    parameters = Option.Array(`--enable`, []);

    file = Option.String();

    inputFile = Option.String(`--input-file`, {
      required: true,
    });

    async execute() {
      const parameters = new Set(this.parameters);

      const source = await fs.promises.readFile(this.file, `utf8`);
      const parser = generate(source, {parameters, mode: this.mode, output: `parser`});

      const input = await fs.promises.readFile(this.inputFile, `utf8`);
      const result = parser.parse(input);

      this.writeJson(result);
    }
  },

  class ProcessDataCommand extends BasePegCommand {
    mode = Option.String(`--mode`, `parser`, {
      validator: isMode,
    });

    parameters = Option.Array(`--enable`, []);

    file = Option.String();

    inputData = Option.String(`--input-data`, {
      required: true,
    });

    async execute() {
      const parameters = new Set(this.parameters);

      const source = await fs.promises.readFile(this.file, `utf8`);
      const parser = generate(source, {parameters, mode: this.mode, output: `parser`});

      const input = this.inputData;
      const result = parser.parse(input);

      this.writeJson(result);
    }
  },
]);
