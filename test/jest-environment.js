/**
 * @file This file is plain JavaScript because my attempts to make it TypeScript have run into issues with Jest forgetting that it's operating in an ES Module context, despite all the configuration making it clear that this project has nothing to do with CommonJS.
 */

import JSDOMEnvironment from 'jest-environment-jsdom';

/**
 * A modified JSDOM environment that includes the Node implementation of the Structured Clone and Fetch APIs.
 */
export default class FixedJSDOMEnvironment extends JSDOMEnvironment {
	constructor(...args) {
		super(...args);
		// JSDOM doesn't implement structuredClone
		// https://github.com/jsdom/jsdom/issues/3363
		this.global.structuredClone = structuredClone;
		this.global.fetch = fetch;
		this.global.Request = Request;
		this.global.Response = Response;

		// JSDOM's Blob implementation doesn't work properly when creating my test data using `new Blob`
		this.global.Blob = Blob;
	}
}
