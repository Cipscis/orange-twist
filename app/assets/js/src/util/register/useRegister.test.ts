import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { act, renderHook } from '@testing-library/preact';

import { useRegister } from './useRegister.js';
import { Register } from './Register.js';

describe('useRegister', () => {
	test('allows a specific value within a register to be observed', async () => {
		const register = new Register<string, number>();

		const { result } = renderHook(() => useRegister(register, 'test'));

		expect(result.current).toBeUndefined();

		await act(() => register.set('test', 1));

		expect(result.current).toBe(1);

		await act(() => register.set('test', 2));

		expect(result.current).toBe(2);
	});

	test('stops observing a specific value after unmounting', async () => {
		const register = new Register<string, number>();

		const { result, unmount } = renderHook(() => useRegister(register, 'test'));

		expect(result.current).toBeUndefined();

		await act(() => register.set('test', 1));

		expect(result.current).toBe(1);

		unmount();
		await act(() => register.set('test', 2));

		expect(result.current).toBe(1);
	});

	test('allows all entries within a register to be observed', async () => {
		const register = new Register([
			['foo', 1],
			['bar', 2],
		]);

		const { result } = renderHook(() => useRegister(register));

		expect(result.current).toEqual([
			['foo', 1],
			['bar', 2],
		]);

		await act(() => register.set('foobar', 3));

		expect(result.current).toEqual([
			['foo', 1],
			['bar', 2],
			['foobar', 3],
		]);
	});

	test('stops observing an entire register after unmounting', async () => {
		const register = new Register([
			['foo', 1],
			['bar', 2],
		]);

		const { result, unmount } = renderHook(() => useRegister(register));

		expect(result.current).toEqual([
			['foo', 1],
			['bar', 2],
		]);

		await act(() => register.set('foobar', 3));

		expect(result.current).toEqual([
			['foo', 1],
			['bar', 2],
			['foobar', 3],
		]);

		expect(result.current).toEqual([
			['foo', 1],
			['bar', 2],
			['foobar', 3],
		]);

		unmount();
		await act(() => register.set('test', 4));

		expect(result.current).toEqual([
			['foo', 1],
			['bar', 2],
			['foobar', 3],
		]);
	});
});
