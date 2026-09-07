// Powered by OnSpace.AI — ESLint flat config
// Docs: https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  // ── Ignored paths ───────────────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'web-build/**',
      'node_modules/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'desktop/build/**',
      'desktop/renderer/**',
      'desktop/node_modules/**',
      'release/**',
      '*.config.js',
    ],
  },

  expoConfig,

  // ── Project rules (TypeScript sources) ──────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Unused code is an error, but `_`-prefixed names are intentional escapes.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Duplicate/misplaced imports hide real bugs — keep them as errors.
      'import/no-duplicates': 'error',
      'import/first': 'error',
      // Stale hook deps are the top source of bugs in this codebase.
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      // The UI is written in French; apostrophes in copy are expected.
      'react/no-unescaped-entities': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // ── Node-side code: Electron main process, build scripts ────────────────────
  {
    files: ['desktop/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // These files are plain CommonJS Node scripts, not TypeScript sources.
      'no-console': 'off',
      'import/no-commonjs': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },

  // Must stay last: turns off every rule Prettier owns.
  prettierConfig,
]);
