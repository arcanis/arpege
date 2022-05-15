import alias         from '@rollup/plugin-alias';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import ts            from '@rollup/plugin-typescript';
import pegjs         from 'rollup-plugin-pegjs';
import {string}      from 'rollup-plugin-string';

const external = [
  `clipanion`,
  `typanion`,
  `vscode`,
];

const plugins = ({tsconfig}) => [
  alias({
    entries: [
      {find: /^\.\/(grammar\.[^./]+)$/, replacement: `./$1.pegjs`},
    ],
  }),
  ts({
    tsconfig,
  }),
  pegjs({
    include: `**/sources/*.pegjs`,
  }),
  string({
    include: `**/examples/*.pegjs`,
  }),
  nodeResolve({
    resolveOnly: [`arpege`],
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
  external,
  preserveSymlinks: true,
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
  external,
  preserveSymlinks: true,
}];
