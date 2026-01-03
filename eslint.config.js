import  {
	defineConfig,
	globalIgnores,
} from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { fixupPluginRules } from '@eslint/compat';

import globals from 'globals';

import stylistic from '@stylistic/eslint-plugin';

import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importNewlines from 'eslint-plugin-import-newlines';
import jest from 'eslint-plugin-jest';

const compat = new FlatCompat({
	baseDirectory: '.',
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default defineConfig([
	{
		languageOptions: {
			globals: {
				...globals.browser,
				// All node globals turned off
				...Object.fromEntries(
					Object.entries(globals.node).map(
						([key]) => [key, 'off']
					)
				),
			},

			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',

			parserOptions: {
				tsConfigRootDir: '.',
				project: [
					'./tsconfig.json',
					'./scripts/tsconfig.json',
					'./test/tsconfig.json',
				],
			},
		},

		plugins: {
			'@stylistic': stylistic,
			'@typescript-eslint': typescriptEslint,
			react,
			'react-hooks': fixupPluginRules(reactHooks),
			'import-newlines': importNewlines,
		},

		extends: compat.extends(
			'eslint:recommended',
			'plugin:@typescript-eslint/recommended',
			'plugin:@typescript-eslint/recommended-requiring-type-checking',
		),

		settings: {
			// Copied from `eslint-config-preact` (which is too opinionated for me to use, e.g. assumes Jest globals)
			react: {
				// eslint-plugin-preact interprets this as "h.createElement",
				// however we only care about marking h() as being a used variable.
				pragma: 'h',
				// We use "react 16.0" to avoid pushing folks to UNSAFE_ methods.
				version: '16.0',
			},
		},

		rules: {
			/////////////////////////
			// Overriding defaults //
			/////////////////////////

			// The `{}` type has many legitimate uses, primarily in "tagging"
			// types to change some behaviours of the TypeScript compiler.
			'@typescript-eslint/no-empty-object-type': [
				'error',
				{
					allowObjectTypes: 'always',
					allowInterfaces: 'always',
				}
			],

			// Sometimes it's useful to leave a name for an unused argument,
			// in case it might be used in the future. Also, using a warning
			// level makes it clearer when there's not a "real" error while
			// authoring new variables.
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					args: 'none',
					caughtErrors: 'none',
					ignoreRestSiblings: true,
				}
			],

			// Sometimes it's useful to use a clearer name than `this`
			'@typescript-eslint/no-this-alias': 'off',

			// There can be value in being explicit about a type that could be inferred,
			// especially if a variable's default value might change in the future
			'@typescript-eslint/no-inferrable-types': 'off',

			// A function returning a `Promise<void>` should be able to go unchecked just
			// like a function that returns `void`
			'@typescript-eslint/no-misused-promises': [
				'error',
				{
					checksVoidReturn: false,
				},
			],

			// I don't mind type coercion in string literal expressions
			'@typescript-eslint/restrict-template-expressions': 'off',

			// There are legitimate uses for empty functions
			'@typescript-eslint/no-empty-function': 'off',

			// Using `any[]` for rest arguments can sometimes be necessary
			'@typescript-eslint/no-explicit-any': [
				'warn',
				{
					ignoreRestArgs: true,
				},
			],

			// There are plenty of times where it's safe to use a Promise without error handling
			'@typescript-eslint/no-floating-promises': 'off',

			// Sometimes it can be useful to create an asynchronous function that doesn't yet do anything
			// asynchronous, but which is planned to eventually become asynchronous, in order to provide
			// a consistent interface
			'@typescript-eslint/require-await': 'warn',

			// This rule was added in an update and seems to fire at very annoying times when it's not helpful
			'@typescript-eslint/no-redundant-type-constituents': 'off',

			/////////////
			// Plugins //
			/////////////
			'import-newlines/enforce': [
				'warn',
				{
					items: 2,
					'max-len': 100,
					forceSingleLine: false,
				},
			],

			////////////////////////
			// Debugging warnings //
			////////////////////////
			'no-debugger': 'warn',
			'no-constant-condition': 'warn',
			'no-console': [
				'warn',
				{
					allow: ['warn', 'error'],
				},
			],
			'no-warning-comments': [
				'warn',
				{
					terms: ['TODO'],
					location: 'start',
				}
			],

			///////////////////////////////
			// TypeScript-specific rules //
			///////////////////////////////
			'@typescript-eslint/consistent-type-assertions': [
				'error',
				{
					assertionStyle: 'as',
				},
			],
			'@typescript-eslint/explicit-module-boundary-types': [
				'error'
			],

			////////////////////////
			// Preact / JSX Rules //
			////////////////////////
			// Copied from `eslint-config-preact` (which is too opinionated for me to use, e.g. assumes Jest globals)
			'react/no-deprecated': 'error',
			// Preact disables this, but in my opinion it should be enabled
			// It automatically picks up our configured `pragma: 'h'` configuration
			'react/react-in-jsx-scope': 'error',
			'react/display-name': ['warn', { ignoreTranspilerName: false }],
			// Modified to only ignore refs and DOM components
			'react/jsx-no-bind': ['warn', {
				ignoreRefs: true,
				ignoreDOMComponents: true,
			}],
			'react/jsx-no-comment-textnodes': 'error',
			'react/jsx-no-duplicate-props': 'error',
			'react/jsx-no-target-blank': 'error',
			'react/jsx-no-undef': 'error',
			'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
			'react/jsx-uses-react': 'error',
			'react/jsx-uses-vars': 'error',
			'react/jsx-key': ['error', { checkFragmentShorthand: true }],
			'react/self-closing-comp': 'error',
			'react/prefer-es6-class': 'error',
			'react/prefer-stateless-function': 'warn',
			'react/require-render-return': 'error',
			'react/no-danger': 'warn',
			// Legacy APIs not supported in Preact:
			'react/no-did-mount-set-state': 'error',
			'react/no-did-update-set-state': 'error',
			'react/no-find-dom-node': 'error',
			'react/no-is-mounted': 'error',
			'react/no-string-refs': 'error',

			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			////////////////
			// Code style //
			////////////////
			'curly': [
				'error',
				'all',
			],
			'default-case-last': 'error',
			'no-var': 'error',
			'one-var': [
				'error',
				'never',
			],

			'@stylistic/array-bracket-newline': [
				'error',
				'consistent',
			],
			'@stylistic/array-bracket-spacing': [
				'error',
				'never',
			],
			'@stylistic/array-element-newline': [
				'error',
				'consistent',
			],
			'@stylistic/arrow-parens': [
				'error',
				'always',
			],
			'@stylistic/block-spacing': [
				'error',
				'always',
			],
			'@stylistic/brace-style': [
				'error',
				'1tbs',
				{
					allowSingleLine: true,
				},
			],
			'@stylistic/comma-dangle': [
				'error',
				{
					arrays: 'always-multiline',
					objects: 'always-multiline',
					imports: 'always-multiline',
					exports: 'always-multiline',
					functions: 'only-multiline',
				},
			],
			'@stylistic/comma-spacing': [
				'error',
				{
					before: false,
					after: true,
				}
			],
			'@stylistic/comma-style': [
				'error',
				'last',
			],
			'@stylistic/eol-last': [
				'error',
				'always',
			],
			'@stylistic/function-call-spacing': [
				'error',
				'never',
			],
			'@stylistic/function-call-argument-newline': [
				'error',
				'consistent',
			],
			'@stylistic/function-paren-newline': [
				'error',
				'multiline-arguments',
			],
			'@stylistic/indent': [
				'error',
				'tab',
				{
					SwitchCase: 1,
					ignoredNodes: [
						// Ignore indentation within template literals to allow them to be indented like markup
						'TemplateLiteral *',
						// This rule doesn't behave correctly for TypeScript generic types
						// https://github.com/typescript-eslint/typescript-eslint/issues/455#issuecomment-560585408
						'TSTypeParameterInstantiation ',
					],
				},
			],
			'@stylistic/key-spacing': [
				'error',
				{
					'beforeColon': false,
					'afterColon': true,
					mode: 'minimum',
				},
			],
			'@stylistic/keyword-spacing': [
				'error',
				{
					'before': true,
					'after': true,
				},
			],
			'@stylistic/multiline-ternary': [
				'error',
				'always-multiline',
			],
			'@stylistic/new-parens': [
				'error',
				'always',
			],
			'@stylistic/no-extra-semi': [
				'error',
			],
			'@stylistic/no-mixed-spaces-and-tabs': [
				'error',
				'smart-tabs',
			],
			'@stylistic/no-trailing-spaces': [
				'error',
			],
			'@stylistic/no-whitespace-before-property': [
				'error',
			],
			'@stylistic/object-curly-newline': [
				'error',
				{
					multiline: true,
					consistent: true,
				},
			],
			'@stylistic/quotes': [
				'error',
				'single',
				{
					allowTemplateLiterals: 'always',
				},
			],
			'@stylistic/rest-spread-spacing': [
				'error',
				'never',
			],
			'@stylistic/semi': [
				'error',
				'always',
			],
			'@stylistic/semi-spacing': [
				'error',
				{
					before: false,
					after: true,
				},
			],
			'@stylistic/semi-style': [
				'error',
				'last',
			],
			'@stylistic/space-before-blocks': [
				'error',
				'always',
			],
			'@stylistic/space-before-function-paren': [
				'error',
				{
					anonymous: 'always',
					named: 'never',
					asyncArrow: 'always',
				},
			],
			'@stylistic/space-in-parens': [
				'error',
				'never',
			],
			'@stylistic/space-unary-ops': [
				'error',
				{
					words: true,
				},
			],
			'@stylistic/spaced-comment': [
				'error',
				'always',
				{
					exceptions: [
						'/',
					],
					markers: [
						'/',
					],
					block: {
						balanced: true,
					},
				},
			],
			'@stylistic/switch-colon-spacing': [
				'error',
				{
					'after': true,
					'before': false,
				},
			],

			// TypeScript-specific code style rules
			'@stylistic/member-delimiter-style': [
				'error',
				{
					multiline: {
						delimiter: 'semi',
						requireLast: true,
					},
					singleline: {
						delimiter: 'semi',
						requireLast: true,
					},
					multilineDetection: 'brackets',
				},
			],
			'@stylistic/type-annotation-spacing': [
				'error',
				{
					before: false,
					after: true,
					// This override is deprecated, but the alternative seems broken
					overrides: {
						arrow: {
							before: true,
							after: true,
						},
					},
				},
			],

			// JSX-specific code style rules
			'@stylistic/jsx-closing-bracket-location': [
				'error',
				'line-aligned',
			],
			'@stylistic/jsx-quotes': [
				'error',
				'prefer-double',
			],
			'@stylistic/jsx-equals-spacing': [
				'error',
				'never',
			],
			'@stylistic/jsx-first-prop-new-line': [
				'error',
				'multiline-multiprop',
			],
			'@stylistic/jsx-max-props-per-line': [
				'error',
				{
					maximum: 1,
					when: 'multiline',
				},
			],
			'@stylistic/jsx-self-closing-comp': [
				'error',
				{
					component: true,
					html: true,
				},
			],
			'@stylistic/jsx-tag-spacing': [
				'error',
				{
					'closingSlash': 'never',
					'beforeSelfClosing': 'always',
					'afterOpening': 'never',
					'beforeClosing': 'allow',
				},
			],
		},
	},
	globalIgnores([
		'**/*.md',
		'**/tsconfig.json',
		'**/.eslintrc.cjs',
		'**/stylelint.config.cjs',
		'**/jest.config.js',
		'**/*.snap',
	]),
	{
		files: ['**/*.{spec,test}.{j,t}{s,sx}'],
		plugins: {
			jest,
		},
		extends: compat.extends('plugin:jest/recommended'),
		rules: {
			// This is a performance concern that doesn't matter as much in tests
			'react/jsx-no-bind': ['warn', {
				ignoreRefs: true,
				allowFunctions: true,
				allowArrowFunctions: true,
			}],
		},
	},
	{
		files: ['scripts/**/*'],
		rules: {
			'no-console': 'off',
		},
	}
]);
