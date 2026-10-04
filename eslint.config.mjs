import tseslint from './tools/quality/node_modules/typescript-eslint/dist/index.js';
export default [
  { ignores: ['**/node_modules/**', '.next/**', '.superpowers/**'] },
  ...tseslint.configs.recommended,
  { files: ['**/*.js', '**/*.mjs'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
];
