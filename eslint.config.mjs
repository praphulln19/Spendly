import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

/*
 * `next lint` is deprecated in Next 15 and removed in 16, and there was no
 * config for it to load -- the script sat on an interactive setup prompt, so
 * nothing here had ever actually been linted. This runs the eslint CLI instead.
 *
 * `eslint-config-next` is still published in eslintrc format, so FlatCompat
 * translates it. When it ships a native flat config the `compat.extends` call
 * becomes a plain spread and this file loses its only dependency.
 */

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'supabase/.temp/**'],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    rules: {
      /*
       * `next/typescript` leaves this a bare warning with no escape hatch, which
       * flags deliberate discards like the `_queuedAt` rest-strip in the offline
       * queue. Underscore-prefixed names opt out; everything else is an error,
       * since an unused local is nearly always a leftover.
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  {
    // The service worker is not part of the bundle and runs in worker scope.
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
      },
    },
  },
];

export default config;
