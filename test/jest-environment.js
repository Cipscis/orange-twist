/**
 * @file This file is plain JavaScript because my attempts to make it TypeScript have run into issues with Jest forgetting that it's operating in an ES Module context, despite all the configuration making it clear that this project has nothing to do with CommonJS.
 */

import JSDOMEnvironment from 'jest-environment-jsdom';

/**
 * A modified JSDOM environment that includes the Node implementation of the Structured Clone API.
 */
export default class FixedJSDOMEnvironment extends JSDOMEnvironment {
	constructor(...args) {
		super(...args);
		this.global.structuredClone = structuredClone;
	}
}
