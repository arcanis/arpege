import {Command, Option, runExit} from 'clipanion';
import fs                         from 'fs';
import * as t                     from 'typanion';
import util                       from 'util';

import {CompileOptions}           from './compiler';
import {generate}                 from './index';
import * as utils                 from './utils';

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
    console.log(err);
    throw err;
  }
}

runExit([
  class GeneratePegCommand extends BasePegCommand {
    format = Option.String(`--format`, `commonjs`, {
      validator: t.isEnum([`amd`, `bare`, `commonjs`, `globals`, `umd`]),
    });

    output = Option.String(`-o,--output`);

    file = Option.String();

    async execute() {
      const source = await fs.promises.readFile(this.file, `utf8`);
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
