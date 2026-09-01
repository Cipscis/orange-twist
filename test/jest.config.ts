import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest';

/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
const config: JestConfigWithTsJest = {
	// Don't inject globals. Require them to be imported from `@jest/globals`
	injectGlobals: false,
	// Specify where the tests are
	rootDir: '../app',
	// Tell Jest how to follow module resolution rules based on tsconfig's baseUrl
	moduleDirectories: ['node_modules', './app/assets/js/src'],
	// Provide a mocked DOM environment for tests
	testEnvironment: 'jsdom',
	// Telling jsdom to use 'node' exports seems necessary to allow importing from Preact
	testEnvironmentOptions: {
		customExportConditions: ['node'],
	},
	// Run a setup script before all test suites
	setupFilesAfterEnv: ['../test/jest.setup.ts'],

	passWithNoTests: true,

	// Allow tests to be written in TypeScript using ESM syntax
	// preset: 'ts-jest/presets/default-esm',
	...createDefaultEsmPreset({
		tsconfig: './test/tsconfig.json',
	}),
};

export default config;
