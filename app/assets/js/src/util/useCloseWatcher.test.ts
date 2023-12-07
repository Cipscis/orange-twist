import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { renderHook } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { useCloseWatcher } from './useCloseWatcher';

describe('useCloseWatcher', () => {
	test('binds a callback to be fired when "Escape" is pressed', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		renderHook(() => useCloseWatcher(spy, true));
		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('if the condition is false, doesn\'t bind a callback', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { rerender } = renderHook(
			(condition) => useCloseWatcher(spy, condition),
			{ initialProps: false }
		);
		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('{Escape}');
		expect(spy).not.toHaveBeenCalled();

		rerender(true);
		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
