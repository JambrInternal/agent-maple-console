import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
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
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
        settings: {
            ...importPlugin.flatConfigs.typescript.settings,
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
                node: {
                    extensions: ['.ts', '.cts', '.mts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'],
                },
            },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            ...importPlugin.flatConfigs.recommended.rules,
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        settings: importPlugin.flatConfigs.typescript.settings,
        rules: {
            ...importPlugin.flatConfigs.typescript.rules,
        },
    },
    {
        files: ['**/*.{jsx,tsx}'],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            'jsx-a11y': jsxA11yPlugin,
        },
        rules: {
            ...jsxA11yPlugin.flatConfigs.recommended.rules,
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
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
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
