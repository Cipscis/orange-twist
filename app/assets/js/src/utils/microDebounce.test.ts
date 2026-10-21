import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { microDebounce } from './microDebounce';

describe('microDebounce', () => {
	test('restricts multiple synchronous calls to a debounced function to one instance', async () => {
		const spy = jest.fn();
		const debouncedSpy = microDebounce(spy);

		debouncedSpy(1);
		debouncedSpy(2);
		debouncedSpy(3);

		expect(spy).not.toHaveBeenCalled();

		await new Promise<void>((resolve) => queueMicrotask(resolve));

		expect(spy).toHaveBeenCalledTimes(1);
		// Only the first attempt actually worked
		expect(spy).toHaveBeenCalledWith(1);
	});

	test('allows subsequent calls after a debounced call is processed', async () => {
		const spy = jest.fn();
		const debouncedSpy = microDebounce(spy);

		debouncedSpy();
		debouncedSpy();

		expect(spy).not.toHaveBeenCalled();
		await new Promise<void>((resolve) => queueMicrotask(resolve));
		expect(spy).toHaveBeenCalledTimes(1);

		debouncedSpy();
		debouncedSpy();

		expect(spy).toHaveBeenCalledTimes(1);
		await new Promise<void>((resolve) => queueMicrotask(resolve));
		expect(spy).toHaveBeenCalledTimes(2);
	});
});
