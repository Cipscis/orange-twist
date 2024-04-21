import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { act, renderHook } from '@testing-library/preact';

import { useRegister } from './useRegister';
import { Register } from './Register';

describe('useRegister', () => {
	test('returns matching data from the register', () => {
		const testRegister = new Register<string, unknown>([
			['a', 1],
			['b', 2],
		]);

		const matcher = (key: string) => key === 'a';

		const { result } = renderHook(() => {
			return useRegister(testRegister, matcher);
		});
		expect(result.current).toEqual([1]);
	});

	test('updates only when relevant changes have been made', async () => {
		const testRegister = new Register<string, unknown>([
			['a', 1],
			['b', 2],
		]);

		const matcher = (key: string) => key === 'a';

		let renderCount = 0;
		const { result } = renderHook(() => {
			renderCount += 1;
			return useRegister(testRegister, matcher);
		});

		expect(result.current).toEqual([1]);
		expect(renderCount).toBe(1);

		// Updating a different entry shouldn't cause rerenders
		await act(() => testRegister.set('b', 3));
		expect(renderCount).toBe(1);

		// Updating a matching entry should cause re-render with new info
		await act(() => testRegister.set('a', 2));
		expect(result.current).toEqual([2]);
		expect(renderCount).toBe(2);
	});

	test('when the matcher changes, returns updated information', () => {
		const testRegister = new Register<string, unknown>([
			['a', 1],
			['b', 2],
		]);

		const matcherA = (key: string) => key === 'a';
		const matcherAll = () => true;

		const {
			rerender,
			result,
		} = renderHook(
			(matcher) => useRegister(testRegister, matcher),
			{ initialProps: matcherA }
		);
		expect(result.current).toEqual([1]);

		rerender(matcherAll);
		expect(result.current).toEqual([1, 2]);
	});
});
