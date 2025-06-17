module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  env: {
    es6: true,
    worker: true,
  },
  globals: {
    // EdgeWorkers globals
    PMUSER_GITHUB_CLIENT_ID: 'readonly',
    PMUSER_GITHUB_CLIENT_SECRET: 'readonly',
    EW: 'readonly',
    crypto: 'readonly',
    btoa: 'readonly',
    console: 'readonly',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};