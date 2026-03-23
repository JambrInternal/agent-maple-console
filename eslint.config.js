import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';

const sharedGlobals = {
    ...globals.browser,
    ...globals.node,
    ...globals.es2021,
};

const strictRules = {
    // Tight baseline correctness and consistency checks.
    eqeqeq: ['error', 'always'],
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-template': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-console': 'error',
};

export default [
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'coverage/**',
            'artifacts/**',
            'src/api/generated/**',
            'agent_docs/**',
        ],
    },
    {
        files: ['**/*.{js,jsx,mjs,cjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: sharedGlobals,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        plugins: {
            react: reactPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            // Keep baseline checks without forcing React 17-era imports.
            'no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^React$',
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'react/jsx-uses-vars': 'error',
            'react/react-in-jsx-scope': 'off',
            ...strictRules,
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: sharedGlobals,
        },
        rules: {
            ...strictRules,
        },
    },
    {
        files: [
            '**/*.test.{js,jsx,ts,tsx}',
            '**/*.spec.{js,jsx,ts,tsx}',
            'src/test/**/*.{js,jsx,ts,tsx}',
        ],
        languageOptions: {
            globals: {
                ...globals.vitest,
                ...sharedGlobals,
            },
        },
        rules: {
            // Test files commonly rely on expression-style assertions and mocks.
            'no-unused-expressions': 'off',
        },
    },
    {
        files: ['scripts/**/*.{js,mjs,cjs}', 'src/utils/verboseLogger.ts'],
        rules: {
            // CLI scripts and logging infrastructure are allowed to use console.
            'no-console': 'off',
        },
    },
];
