import fs  from 'fs';
import peg from 'pegjs-dev';

const grammar = fs.readFileSync(require.resolve(`./grammar.pegjs.pegjs`), `utf8`);
const parser = peg.generate(grammar);

// eslint-disable-next-line arca/no-default-export
export default parser;
