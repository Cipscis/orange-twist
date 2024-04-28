import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { useStatePersist } from './useStatePersist';
import { act, renderHook } from '@testing-library/preact';

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

describe('useStatePersist', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test('Returns a state value and a setter function in a tuple', async () => {
		const { result } = renderHook(
			() => useStatePersist('test', 'default value', isString)
		);
		expect(Array.isArray(result.current)).toBe(true);
		expect(result.current.length).toBe(2);
		expect(result.current[0]).toBe('default value');
		expect(typeof result.current[1]).toBe('function');

		await act(() => result.current[1]('new value'));
		expect(result.current[0]).toBe('new value');
	});

	test('Retrieves a persisted value to use as the initial value', () => {
		localStorage.setItem('test', JSON.stringify('persisted value'));

		const { result } = renderHook(
			() => useStatePersist('test', 'default value', isString)
		);
		expect(result.current[0]).toBe('persisted value');
	});

	test('Uses a specified default value if there is no persisted value', () => {
		const { result } = renderHook(
			() => useStatePersist('test', 'default value', isString)
		);
		expect(Array.isArray(result.current)).toBe(true);
		expect(result.current[0]).toBe('default value');
	});

	test('Uses a specified default value if the persisted value is invalid', () => {
		localStorage.setItem('test', JSON.stringify(5));

		const { result } = renderHook(
			() => useStatePersist('test', 'default value', isString)
		);
		expect(result.current[0]).toBe('default value');
	});

	test('Updates the persisted value when the setter is called', () => {
		const { result } = renderHook(
			() => useStatePersist('test', 'default value', isString)
		);

		expect(localStorage.getItem('test')).toBeNull();
		act(() => result.current[1]('new value'));
		expect(localStorage.getItem('test')).toBe(JSON.stringify('new value'));
	});
});
