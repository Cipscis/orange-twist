import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import userEvent from '@testing-library/user-event';

import { renderHook } from '@testing-library/preact';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName';
import { registerKeyboardShortcut } from '../registerKeyboardShortcut';

import {
	addCommandListener,
	registerCommand,
	unregisterCommand,
} from 'registers/commands';

import { useKeyboardShortcut } from './useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
	beforeAll(() => {
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);
	});

	beforeEach(() => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Example command' });
	});
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
	});

	test('binds a keyboard shortcut to a listener', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { unmount } = renderHook(() => useKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, spy));

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);

		unmount();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('binds a keyboard shortcut to a command', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		addCommandListener('__TEST_COMMAND_A__', spy);

		const { unmount } = renderHook(
			() => useKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__')
		);

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);

		unmount();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});
});
