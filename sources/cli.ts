import {Command, Option, runExit, UsageError} from 'clipanion';
import fs                                     from 'fs';
import * as t                                 from 'typanion';
import util                                   from 'util';

import {CompileOptions}                       from './compiler';
import {generate}                             from './index';

abstract class BasePegCommand extends Command {
  tokenizer = Option.Boolean(`--tokenizer`, false);

  getParserOptions(): Partial<CompileOptions> {
    return {
      tokenizer: this.tokenizer,
    };
  }

  writeJson(data: any) {
    const pretty = process.stdout.isTTY
      ? util.inspect(data, {depth: Infinity, colors: true})
      : JSON.stringify(data, null, 2);

    this.context.stdout.write(`${pretty}\n`);
  }

  async catch(err: any) {
    if (err.name === `PegSyntaxError`) {
      let message = err.message;
      if (err.location)
        message = message.replace(/\.$/, ` at line ${err.location.start.line}, column ${err.location.start.column}.`);

      throw new UsageError(message);
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
    format = Option.String(`--format`, `commonjs`, {
      validator: t.isEnum([`amd`, `bare`, `commonjs`, `globals`, `umd`]),
    });

    output = Option.String(`-o,--output`);
    types = Option.Boolean(`--types`);

    file = Option.String();

    async execute() {
      const source = await fs.promises.readFile(this.file, `utf8`);

      if (this.types) {
        const code = generate(source, {...this.getParserOptions(), output: `types`, format: this.format});

        if (typeof this.output !== `undefined`) {
          await fs.promises.writeFile(`${this.output}.d.ts`, code);
        } else {
          this.context.stdout.write(code);
          return;
        }
      }

      const code = generate(source, {...this.getParserOptions(), output: `source`, format: this.format});

      if (typeof this.output !== `undefined`) {
        await fs.promises.writeFile(this.output, code);
      } else {
        this.context.stdout.write(code);
      }
    }
  },

  class ProcessFileCommand extends BasePegCommand {
    file = Option.String();

    inputFile = Option.String(`--input-file`, {
      required: true,
    });

    async execute() {
      const source = await fs.promises.readFile(this.file, `utf8`);
      const parser = generate(source, {...this.getParserOptions(), output: `parser`});

      const input = await fs.promises.readFile(this.inputFile, `utf8`);
      const result = parser.parse(input);

      this.writeJson(result);
    }
  },

  class ProcessDataCommand extends BasePegCommand {
    file = Option.String();

    inputData = Option.String(`--input-data`, {
      required: true,
    });

    async execute() {
      const source = await fs.promises.readFile(this.file, `utf8`);
      const parser = generate(source, {...this.getParserOptions(), output: `parser`});

      const input = this.inputData;
      const result = parser.parse(input);

      this.writeJson(result);
    }
  },
]);
