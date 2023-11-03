/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @typedef {import('ts-jest').JestConfigWithTsJest} JestConfigWithTsJest */

/** @type {JestConfigWithTsJest} */
const config = {
	// Don't inject globals. Require them to be imported from `@jest/globals`
	injectGlobals: false,
	// Specify where the tests are
	rootDir: './app',
	// Tell Jest how to follow module resolution rules based on tsconfig's baseUrl
	moduleDirectories: ['node_modules', './app/assets/js/src'],
	// Provide a mocked DOM environment for tests
	testEnvironment: 'jsdom',
	// Telling jsdom to use 'node' exports seems necessary to allow importing from Preact
	testEnvironmentOptions: {
		customExportConditions: ['node'],
	},

	// Allow tests to be written in TypeScript using ESM syntax
	preset: 'ts-jest/presets/default-esm',

	passWithNoTests: true,
};

export default config;
