import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ls } from 'persist';

const { localStorage } = window;

describe('ls', () => {
	afterEach(() => {
		window.localStorage = localStorage;
		localStorage.clear();
	});

	describe('set', () => {
		test('returns a Promise that resolves when data has been stored', async () => {
			const result = ls.set('test', 1);
			expect(result).toBeInstanceOf(Promise);

			expect(await result).toBeUndefined();
			expect(
				JSON.parse(localStorage.getItem('test')!)
			).toBe(1);
		});

		test('rejects if data could not be serialised', async () => {
			await expect(
				ls.set('test', 1n)
			).rejects.toBeInstanceOf(Error);
		});

		test('rejects if localStorage is not available', async () => {
			// @ts-expect-error Just deleting localStorage for a test
			delete window.localStorage;

			await expect(
				ls.set('test', 1)
			).rejects.toBeInstanceOf(Error);
		});
	});

	describe('get', () => {
		beforeEach(() => {
			ls.set('test', { foo: 'bar' });
		});

		test('returns a Promise that resolves with persisted data', async () => {
			const result = ls.get('test');
			expect(result).toBeInstanceOf(Promise);

			const data = await result;
			expect(data).toEqual({ foo: 'bar' });
		});

		test('returns a Promise that resolves with null if there is no persisted data', async () => {
			expect(
				await ls.get('nothing')
			).toBeUndefined();
		});

		test('rejects if localStorage is not available', async () => {
			// @ts-expect-error Just deleting localStorage for a test
			delete window.localStorage;

			await expect(
				ls.get('test')
			).rejects.toBeInstanceOf(Error);
		});
	});

	describe('delete', () => {
		beforeEach(() => {
			ls.set('test', { foo: 'bar' });
		});

		test('returns a Promise that resolves when persisted data has been deleted', async () => {
			const result = ls.delete('test');
			expect(result).toBeInstanceOf(Promise);

			expect(await result).toBeUndefined();
			expect(
				await ls.get('test')
			).toBeUndefined();
		});

		test('does nothing if no data was persisted at the given key', async () => {
			await expect(
				ls.delete('nothing')
			).resolves.toBeUndefined();
		});

		test('rejects if localStorage is not available', async () => {
			// @ts-expect-error Just deleting localStorage for a test
			delete window.localStorage;

			await expect(
				ls.delete('test')
			).rejects.toBeInstanceOf(Error);
		});
	});
});
