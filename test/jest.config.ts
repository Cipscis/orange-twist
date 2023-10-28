/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
	// Allow tests to be written in TypeScript using ESM syntax
	preset: 'ts-jest/presets/default-esm',
	// Allow Jest's module resolution to find TypeScript files when imported as `.js`
	resolver: 'ts-jest-resolver',
	// Don't inject globals. Require them to be imported from `@jest/globals`
	injectGlobals: false,
	// Specify where the tests are
	rootDir: '../app',
	// Currently tests don't need a virtual DOM environment
	testEnvironment: 'node',
};

export default config;
