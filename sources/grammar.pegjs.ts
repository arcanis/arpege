import fs         from 'fs';
import {generate} from 'pegjs';

// @ts-expect-error
import lkgParser  from './lkg-parser';

const grammar = fs.readFileSync(require.resolve(`./grammar.pegjs.pegjs`), `utf8`);
const parser = {
  parse(...args: Array<any>) {
    return generate(grammar, {format: `commonjs`, output: `parser`, parser: lkgParser}).parse(...args);
  },
};

// eslint-disable-next-line arca/no-default-export
export default parser;
