import {generate} from 'arpege';
import fs         from 'fs';

import lkgParser  from './lkg-parser';

const grammar = fs.readFileSync(require.resolve(`./grammar.pegjs.pegjs`), `utf8`);
let parserImpl: any;

const parser = {
  parse(...args: Array<any>) {
    if (typeof parserImpl === `undefined`) {
      parserImpl = process.env.USE_LKG
        ? lkgParser
        : generate(grammar, {format: `commonjs`, output: `parser`, parser: lkgParser});
    }

    return parserImpl.parse(...args);
  },
};

// eslint-disable-next-line arca/no-default-export
export default parser;
