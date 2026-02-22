import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { requestAsyncCallback } from './requestAsyncCallback';

describe('requestAsyncCallback', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test('calls the callback within a proscribed deadline', () => {
		const spy = jest.fn();

		requestAsyncCallback(spy, { deadline: 1000 });
		expect(spy).not.toHaveBeenCalled();

		jest.advanceTimersByTime(1000);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('cancels the callback if the signal is aborted', () => {
		const spy = jest.fn();
		const controller = new AbortController();
		const { signal } = controller;

		requestAsyncCallback(spy, { deadline: 1500, signal });

		controller.abort();
		jest.advanceTimersByTime(1500);

		expect(spy).not.toHaveBeenCalled();
	});

	test(`won't call the callback if provided with an aborted signal`, () => {
		const spy = jest.fn();
		const signal = AbortSignal.abort();

		requestAsyncCallback(spy, { deadline: 1500, signal });

		jest.advanceTimersByTime(1500);

		expect(spy).not.toHaveBeenCalled();
	});
});
