module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // TypeScript specific
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // General JavaScript/TypeScript
    'no-console': 'off', // Allow console.log for server logging
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',

    // Import/Export
    'no-duplicate-imports': 'error',

    // Code style
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always'],
    'no-trailing-spaces': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js', // Ignore JS files in root (like this config)
  ],
};
