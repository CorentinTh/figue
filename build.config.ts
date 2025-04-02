import type { BuildConfig } from 'unbuild';

const config: BuildConfig = {
  entries: ['./src/index'],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  clean: true,
};

export default config;
