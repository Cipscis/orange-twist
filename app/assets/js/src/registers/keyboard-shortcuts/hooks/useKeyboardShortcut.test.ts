import {
	beforeAll,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import userEvent from '@testing-library/user-event';

import { renderHook } from '@testing-library/preact';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName.js';
import { registerKeyboardShortcut } from '../keyboardShortcutsRegister.js';

import {
	Command,
	addCommandListener,
} from '../../commands/index.js';

import { useKeyboardShortcut } from './useKeyboardShortcut.js';

describe('useKeyboardShortcut', () => {
	beforeAll(() => {
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);
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

		addCommandListener(Command.DATA_SAVE, spy);

		const { unmount } = renderHook(() => useKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE));

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);

		unmount();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});
});
