import {
	describe,
	expect,
	test,
} from '@jest/globals';
import { renderHook } from '@testing-library/preact';

import { usePropAsRef } from './usePropAsRef';

describe('usePropAsRef', () => {
	test('creates a ref, initialised to the prop\'s initial value', () => {
		const { result } = renderHook(
			(prop) => usePropAsRef(prop),
			{ initialProps: 1 }
		);

		expect(result.current).toEqual({ current: 1 });
	});

	test('keeps its value up to date as the prop\'s value changes', () => {
		const {
			result,
			rerender,
		} = renderHook(
			(prop) => usePropAsRef(prop),
			{ initialProps: 1 }
		);

		expect(result.current.current).toBe(1);

		rerender(2);

		expect(result.current.current).toBe(2);
	});
});
