import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    // Ignorar archivos y directorios globales que no deben ser lintados
    ignores: [
      'node_modules',
      'dist',
      'commitlint.config.ts', // Generalmente no se linta
      'eslint.config.ts', // Generalmente no se linta a sí mismo
    ],
  },
  js.configs.recommended, // Configuración recomendada para JavaScript

  // --- Bloque de configuración para archivos específicos de Node.js (como vite.config.ts) ---
  {
    files: ['vite.config.ts'], // Aplica solo a vite.config.ts
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Para vite.config.ts, seguimos apuntando explícitamente a tsconfig.node.json
        // porque es un entorno distinto y es más preciso.
        project: ['./tsconfig.node.json'],
      },
      globals: {
        ...globals.node, // Solo globales de Node.js
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Puedes añadir más reglas específicas para archivos de Node.js aquí
    },
  },

  // --- Bloque de configuración para archivos TypeScript puros de tu aplicación (.ts, .tsx) ---
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Ignoramos vite.config.ts en este bloque para evitar conflictos con el bloque anterior
    ignores: ['vite.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // ¡CAMBIO CLAVE AQUÍ! Usamos projectService: true
        projectService: true,
        // Eliminamos 'project' ya que projectService lo manejará mejor con referencias
        // project: ['./tsconfig.json'], // ¡QUITAR ESTO!
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        // ...globals.node, // No siempre necesario para código frontend
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          projec: './tsconfig.json',
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'warn',
    },
  },

  // --- Bloque de configuración para archivos Vue y TypeScript (.vue) ---
  {
    files: ['**/*.vue'],
    // Ignoramos vite.config.ts aquí también
    ignores: ['vite.config.ts'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser, // Para analizar el script dentro de los SFC de Vue
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        // ¡CAMBIO CLAVE AQUÍ! Usamos projectService: true
        projectService: true,
        // Eliminamos 'project'
        // project: ['./tsconfig.json'], // ¡QUITAR ESTO!
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        // ...globals.node, // No siempre necesario para código frontend
      },
    },
    plugins: {
      vue,
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'warn',
    },
  },
  prettier, // Asegura que Prettier se ejecute al final
];
