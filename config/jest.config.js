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
	rootDir: '../app',
	// Provide a mocked DOM environment for tests
	testEnvironment: 'jsdom',
	// Telling jsdom to use 'node' exports seems necessary to allow importing from Preact
	testEnvironmentOptions: {
		customExportConditions: ['node'],
	},

	// Allow tests to be written in TypeScript using ESM syntax
	preset: 'ts-jest/presets/default-esm',
	// Allow Jest's module resolution to find TypeScript files when imported as `.js`
	resolver: 'ts-jest-resolver',

	passWithNoTests: true,
};

export default config;
