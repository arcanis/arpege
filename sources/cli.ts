import {Command, Option, runExit} from 'clipanion';
import fs                         from 'fs';

import {generate}                 from './index';

runExit(class PegCommand extends Command {
  file = Option.String();

  async execute() {
    const content = await fs.promises.readFile(this.file, `utf8`);
    const output = generate(content, {output: `source`, tokenizer: true});

    this.context.stdout.write(`${output}\n`);
  }
});
