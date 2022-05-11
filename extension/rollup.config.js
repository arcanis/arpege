import alias from '@rollup/plugin-alias';
import ts    from '@rollup/plugin-typescript';
import pegjs from 'rollup-plugin-pegjs';

// eslint-disable-next-line arca/no-default-export
export default {
  input: [
    `./sources/extension.ts`,
  ],
  output: [{
    dir: `lib`,
    entryFileNames: `[name].js`,
    format: `cjs`,
    sourcemap: true,
  }],
  plugins: [
    alias({
      entries: [
        {find: /(grammar\.[^.]+)$/, replacement: `$1.pegjs`},
      ],
    }),
    pegjs(),
    ts({
      tsconfig: `../tsconfig.extension.json`,
    }),
  ],
};
