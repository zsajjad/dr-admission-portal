import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      // Treat `@/` alias imports as internal across the project
      'import/internal-regex': '^@/',
    },
    rules: {
      // Disallow multiple consecutive blank lines anywhere (including between imports)
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 1 }],
      'import/order': [
        'error',
        {
          // Keep relative imports at the end; separate alias categories; blank lines between groups
          groups: ['builtin', 'external', 'internal', 'object', 'parent', 'sibling', 'index'],
          pathGroups: [
            // Ensure React imports are first among externals
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'react-dom', group: 'external', position: 'before' },
            // Optionally keep Next grouped near other externals (not required, but common)
            { pattern: 'next', group: 'external', position: 'after' },
            { pattern: 'next/**', group: 'external', position: 'after' },
            // Keep MUI in the regular external block so it appears after React
            { pattern: '@mui/**', group: 'external', position: 'after' },
            // Alias categories (ordered): domains first, then components, then other internal groups
            { pattern: '@/domains/**', group: 'internal', position: 'after' },
            { pattern: '@/components/**', group: 'internal', position: 'after' },
            { pattern: '@/providers/**', group: 'internal', position: 'after' },
            { pattern: '@/services/**', group: 'internal', position: 'after' },
            { pattern: '@/theme/**', group: 'internal', position: 'after' },
            { pattern: '@/registry/**', group: 'internal', position: 'after' },
            { pattern: '@/platform/**', group: 'internal', position: 'after' },
            { pattern: '@/assets/**', group: 'internal', position: 'after' },
            { pattern: '@/hooks/**', group: 'internal', position: 'after' },
            { pattern: '@/contexts/**', group: 'internal', position: 'after' },
            { pattern: '@/router/**', group: 'internal', position: 'after' },
            { pattern: '@/translations/**', group: 'internal', position: 'after' },
            { pattern: '@/constants/**', group: 'internal', position: 'after' },
            { pattern: '@/types/**', group: 'internal', position: 'after' },
            { pattern: '@/utils/**', group: 'internal', position: 'after' },
            { pattern: '@/app/**', group: 'internal', position: 'after' },
            // Fallback for any other alias import under @/
            { pattern: '@/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
    },
    ignores: ['node_modules', '.next', 'dist', 'src/providers/service/**', 'src/providers/activityLogger/**'],
  },
  // Generated API clients: relax strict rules
  {
    files: ['src/providers/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default eslintConfig;
