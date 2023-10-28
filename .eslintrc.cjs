module.exports = {
	root: true,
	env: {
		browser: true,
		es2021: true,
		node: false,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		tsConfigRootDir: __dirname,
		project: ['./tsconfig.json', './server/tsconfig.json', './build/tsconfig.json'],
	},
	plugins: [
		'@typescript-eslint',
		'react',
		'react-hooks',
	],
	settings: {
		// Copied from `eslint-confict-preact` (which is too opinionated for me to use, e.g. assumes Jest)
		react: {
			// eslint-plugin-preact interprets this as "h.createElement",
			// however we only care about marking h() as being a used variable.
			pragma: 'h',
			// We use "react 16.0" to avoid pushing folks to UNSAFE_ methods.
			version: '16.0'
		},
	},
	ignorePatterns: ['*.md'],
	rules: {
		/////////////////////////
		// Overriding defaults //
		/////////////////////////

		// Sometimes it's useful to leave a name for an unused argument,
		// in case it might be used in the future. Also, using a warning
		// level makes it clearer when there's not a "real" error while
		// authoring new variables.
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				args: 'none',
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

		// I like being able to use `'' + val` to coerce an unknown type to a string
		'@typescript-eslint/restrict-plus-operands': 'off',

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

		// TypeScript namespaces serve a different purpose to modules, and are sometimes necessary,
		// such as when extending the `Window` interface to add support for legacy APIs
		'@typescript-eslint/no-namespace': 'off',

		// There are plenty of times where it's safe to use a Promise without error handling
		'@typescript-eslint/no-floating-promises': 'off',

		// Sometimes it can be useful to create an asynchronous function that doesn't yet do anything
		// asynchronous, but which is planned to eventually become asynchronous, in order to provide
		// a consistent interface
		'@typescript-eslint/require-await': 'warn',

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

		////////////////////////
		// Preact / JSX Rules //
		////////////////////////
		// Copied from `eslint-confict-preact` (which is too opinionated for me to use, e.g. assumes Jest)
		'react/no-deprecated': 'error',
		'react/react-in-jsx-scope': 'off',
		'react/display-name': ['warn', { ignoreTranspilerName: false }],
		'react/jsx-no-bind': ['warn', {
			ignoreRefs: true,
			allowFunctions: true,
			allowArrowFunctions: true
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
		'array-bracket-spacing': [
			'error',
			'never',
		],
		'arrow-parens': [
			'error',
			'always',
		],
		'arrow-spacing': [
			'error',
			{
				before: true,
				after: true,
			},
		],
		'block-spacing': [
			'error',
			'always',
		],
		'brace-style': [
			'error',
			'1tbs',
			{
				allowSingleLine: true,
			},
		],
		'comma-dangle': [
			'error',
			{
				arrays: 'always-multiline',
				objects: 'always-multiline',
				imports: 'always-multiline',
				exports: 'always-multiline',
				functions: 'only-multiline',
			},
		],
		'comma-spacing': [
			'error',
			{
				before: false,
				after: true,
			}
		],
		'comma-style': [
			'error',
			'last',
		],
		'curly': [
			'error',
			'all',
		],
		'default-case-last': 'error',
		'eol-last': [
			'error',
			'always',
		],
		'func-call-spacing': [
			'error',
			'never',
		],
		'indent': [
			'error',
			'tab',
			{
				SwitchCase: 1,
				ignoredNodes: [
					// Ignore indentation within template literals to allow them to be indented like markup
					"TemplateLiteral *",
				],
			},
		],
		// My IDE handles this, it's annoying to see the squigly lines appear
		'no-trailing-spaces': [
			'off',
		],
		'no-var': 'error',
		'one-var': [
			'error',
			'never',
		],
		'quotes': [
			'error',
			'single',
			{
				allowTemplateLiterals: true,
			},
		],
		'rest-spread-spacing': [
			'error',
			'never',
		],
		'semi': [
			'error',
			'always',
		],
		'semi-spacing': [
			'error',
			{
				before: false,
				after: true,
			},
		],
		'semi-style': [
			'error',
			'last',
		],
		'space-before-blocks': [
			'error',
			'always',
		],
		'space-before-function-paren': 'off',
		'@typescript-eslint/space-before-function-paren': [
			'error',
			{
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'always',
			},
		],
		'space-in-parens': [
			'error',
			'never',
		],
		'space-unary-ops': [
			'error',
			{
				words: true,
			},
		],
		'spaced-comment': [
			'error',
			'always',
			{
				exceptions: [
					'/',
				],
				block: {
					balanced: true,
				},
			},
		],
		'no-mixed-spaces-and-tabs': [
			'error',
			'smart-tabs',
		],

		// TypeScript-specific rules
		'@typescript-eslint/consistent-type-assertions': [
			'error',
			{
				assertionStyle: 'as',
			},
		],
	}
};
