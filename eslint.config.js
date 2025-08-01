// eslint.config.js
import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },

  rules: {
    // To allow export on top of files
    'curly': ['error', 'all'],
    'vitest/consistent-test-it': ['error', { fn: 'test' }],
    'ts/consistent-type-definitions': ['error', 'type'],
    'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'unused-imports/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
  },

  ignores: ['README.md', 'demo/*'],
});
