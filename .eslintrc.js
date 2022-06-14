module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:unicorn/recommended',
  ],
  rules: {
    'no-console': 'off',
    'no-extra-boolean-cast': 'off',
    'arrow-parens': [2, 'as-needed'],
    'prettier/prettier': 2,
    eqeqeq: ['error', 'always'],
    'newline-after-var': ["error", "always"],
    'unicorn/prefer-module': 0,
    'unicorn/prefer-node-protocol': 0,
    'unicorn/prefer-json-parse-buffer': 0,
    'unicorn/no-process-exit' : 0,
  },
};
