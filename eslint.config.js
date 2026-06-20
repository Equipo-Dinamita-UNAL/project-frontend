import js from '@eslint/js';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        Promise: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {

      // ══════════════════════════════════════════
      // MUST-1 — Nombres que revelan intención
      // Clean Code Cap. 2
      // ══════════════════════════════════════════
      'id-length': ['error', {
        min: 2,
        exceptions: ['e', 'i', 'j', 'k', 'x', 'y'],
        properties: 'never',
      }],

      // ══════════════════════════════════════════
      // MUST-2 — Sin variables no usadas
      // Clean Code Cap. 17 — sin código muerto
      // ══════════════════════════════════════════
      'no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      }],

      // ══════════════════════════════════════════
      // MUST-3 — Sin var (solo const y let)
      // JavaScript moderno
      // ══════════════════════════════════════════
      'no-var': 'error',

      // ══════════════════════════════════════════
      // MUST-4 — Preferir const
      // Clean Code — inmutabilidad por defecto
      // ══════════════════════════════════════════
      'prefer-const': ['error', {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      }],

      // ══════════════════════════════════════════
      // MUST-5 — Reglas de hooks React
      // React Hooks — uso correcto
      // ══════════════════════════════════════════
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ══════════════════════════════════════════
      // MUST-6 — Sin console.log en producción
      // Clean Code — sin código de debug
      // ══════════════════════════════════════════
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // ══════════════════════════════════════════
      // MUST-7 — Sin código inalcanzable
      // Clean Code Cap. 17
      // ══════════════════════════════════════════
      'no-unreachable': 'error',

      // ══════════════════════════════════════════
      // SHOULD-1 — Igualdad estricta
      // JavaScript buenas prácticas
      // ══════════════════════════════════════════
      'eqeqeq': ['error', 'always'],

      // ══════════════════════════════════════════
      // SHOULD-2 — Sin imports duplicados
      // Clean Code — sin código redundante
      // ══════════════════════════════════════════
      'no-duplicate-imports': 'error',

      // ══════════════════════════════════════════
      // SHOULD-3 — Sin números mágicos
      // Clean Code Cap. 2
      // ══════════════════════════════════════════
      'no-magic-numbers': ['warn', {
        ignore: [0, 1, -1],
        ignoreArrayIndexes: true,
        enforceConst: true,
      }],

    },
  },
];
