import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import { renderHook } from '@testing-library/preact';

import { fireCommand } from '../fireCommand';
import { registerCommand, unregisterCommand } from '../registerCommand';
import { useCommand } from './useCommand';

describe('useCommand', () => {
	beforeEach(() => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Test command' });
	});
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
	});

	test('binds the specified listener to the command until unmounted', () => {
		const spy = jest.fn();

		const { unmount } = renderHook(
			() => useCommand('__TEST_COMMAND_A__', spy)
		);

		expect(spy).not.toHaveBeenCalled();

		fireCommand('__TEST_COMMAND_A__');
		expect(spy).toHaveBeenCalledTimes(1);

		unmount();
		fireCommand('__TEST_COMMAND_A__');
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
