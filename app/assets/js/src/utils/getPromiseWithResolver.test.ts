import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { getPromiseWithResolver } from './getPromiseWithResolver';

describe('getPromiseWithResolver', () => {
	test('returns a tuple containing a Promise and a function', () => {
		const result = getPromiseWithResolver();
		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(2);
		expect(result[0]).toBeInstanceOf(Promise);
		expect(typeof result[1]).toBe('function');
	});

	test('resolves the Promise when the resolver is called', async () => {
		const [promise, resolve] = getPromiseWithResolver();

		const spy = jest.fn();
		promise.then(spy);
		expect(spy).not.toHaveBeenCalled();

		resolve(true);
		await expect(promise).resolves.toBe(true);
		expect(spy).toHaveBeenCalledTimes(1);

		resolve(false);
		await expect(promise).resolves.toBe(true);
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
