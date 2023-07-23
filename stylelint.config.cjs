module.exports = {
	extends: 'stylelint-config-recommended-scss',
	rules: {
		/////////////////////////
		// Overriding defaults //
		/////////////////////////

		// I like laying out empty blocks to make it clear
		// what other elements exist for a component. Empty
		// blocks are removed when SCSS is compiled anyway.
		'block-no-empty': null,

		// If custom elements are used, there should be no
		// problem with styling them.
		'selector-type-no-unknown': [
			true,
			{
				ignore: ['custom-elements'],
			},
		],

		// Empty comments can be useful for spacing and formatting
		'scss/comment-no-empty': null,

		// Duplicate selectors can be useful for nesting different children
		// in ways that are easier to follow
		'no-duplicate-selectors': null,

		// No descending specificity is useful when deeply nested selectors are
		// used, but well-written SCSS should not run into these being an issue
		'no-descending-specificity': null,

		////////////////////////
		// Debugging warnings //
		////////////////////////
		'comment-word-disallowed-list': [
			['/^TODO/'],
			{
				severity: 'warning',
			},
		],

		//////////////////////
		// Coding standards //
		//////////////////////

		// If a selector includes an ID, a second ID should not be necessary
		'selector-max-id': 1,

		// Type selectors should be avoided wherever possible, but there are
		// some rare occasions where two are needed
		'selector-max-type': 2,

		////////////////
		// Code style //
		////////////////

		// BEM style. All lowercase letters or numbers with separators of - or -- or __
		// Cannot start with a number
		'selector-class-pattern': '^[a-z][a-z0-9]*((-{1,2}|__)[a-z0-9]+)*$',

		// All lowercase letters or numbers with separators of -
		// Cannot start with a number
		'selector-id-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',

		// camelCase
		'keyframes-name-pattern': '^[a-z]+([A-Z][a-z]+)*$',

		'selector-pseudo-element-colon-notation': 'double',

		'no-irregular-whitespace': true,

		'font-family-name-quotes': 'always-unless-keyword',

		// These code style rules are frozen in `Stylelint`
		///////////////////////////////////////////////////

		'value-keyword-case': [
			'lower',
			{
				camelCaseSvgKeywords: true,
			},
		],

		'function-name-case': 'lower',

		'selector-type-case': 'lower',

		'comment-whitespace-inside': 'always',

		'scss/at-else-closing-brace-newline-after': 'always-last-in-chain',
	},
};

