import { createRef, h } from 'preact';
import type { PropsWithChildren } from 'preact/compat';

import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { renderHook } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { useBlurCallback } from './useBlurCallback';

describe('useBlurCallback', () => {
	test('calls callback when losing focus', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const ref = createRef<HTMLDivElement>();
		const wrapper = ({ children }: PropsWithChildren) => <div ref={ref} tabindex={-1}>{children}</div>;

		renderHook(() => useBlurCallback(
			ref,
			spy
		), { wrapper });

		ref.current?.focus();
		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('doesn\'t bind events if condition is false', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const ref = createRef<HTMLDivElement>();
		const wrapper = ({ children }: PropsWithChildren) => <div ref={ref} tabindex={-1}>{children}</div>;

		const { rerender } = renderHook(({ ref, callback, condition }) => useBlurCallback(
			ref,
			callback,
			condition
		), {
			wrapper,
			initialProps: {
				ref,
				callback: spy,
				condition: false,
			},
		});

		ref.current?.focus();
		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);
		expect(spy).not.toHaveBeenCalled();

		ref.current?.focus();
		expect(spy).not.toHaveBeenCalled();

		rerender({
			ref,
			callback: spy,
			condition: true,
		});

		await user.click(document.body);
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
