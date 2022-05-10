import alias from '@rollup/plugin-alias';
import ts    from '@rollup/plugin-typescript';
import pegjs from 'rollup-plugin-pegjs';

const plugins = ({tsconfig}) => [
  pegjs(),
  alias({
    entries: [
      {find: /^.*\/(grammar\.[^./]+)$/, replacement: `${__dirname}/examples/$1.pegjs`},
    ],
  }),
  ts({
    tsconfig,
  }),
];

// eslint-disable-next-line arca/no-default-export
export default [{
  input: [
    `./sources/cli.ts`,
    `./sources/index.ts`,
  ],
  output: [{
    dir: `lib`,
    entryFileNames: `[name].mjs`,
    format: `es`,
  }, {
    dir: `lib`,
    entryFileNames: `[name].js`,
    format: `cjs`,
  }],
  plugins: plugins({
    tsconfig: `tsconfig.dist.json`,
  }),
}, {
  input: [
    `./extension/sources/extension.ts`,
  ],
  output: [{
    dir: `./extension/lib`,
    entryFileNames: `[name].js`,
    format: `cjs`,
  }],
  plugins: plugins({
    tsconfig: `tsconfig.extension.json`,
  }),
}];
