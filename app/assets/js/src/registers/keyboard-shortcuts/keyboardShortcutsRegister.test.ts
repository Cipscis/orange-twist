import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import userEvent from '@testing-library/user-event';

import { KeyboardShortcutName } from './types/KeyboardShortcutName.js';

import { registerKeyboardShortcut } from './keyboardShortcutsRegister.js';
import { addKeyboardShortcutListener } from './listeners/addKeyboardShortcutListener.js';

describe('registerKeyboardShortcut', () => {
	test('sets the key combos that will fire a keyboard shortcut', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy);

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [
			{ key: 'a' },
			{ key: 'b', ctrl: true },
			{ key: 'c', alt: true },
			{ key: 'd', shift: true },
			{ key: 'e', ctrl: true, alt: true, shift: true },
		]);

		expect(spy).not.toHaveBeenCalled();
		await user.keyboard('a');
		expect(spy).toHaveBeenCalledTimes(1);
		await user.keyboard('{Control>}a{/Control}');
		expect(spy).toHaveBeenCalledTimes(1);

		await user.keyboard('b');
		expect(spy).toHaveBeenCalledTimes(1);
		await user.keyboard('{Control>}b{/Control}');
		expect(spy).toHaveBeenCalledTimes(2);

		await user.keyboard('c');
		expect(spy).toHaveBeenCalledTimes(2);
		await user.keyboard('{Alt>}c{/Alt}');
		expect(spy).toHaveBeenCalledTimes(3);

		await user.keyboard('d');
		expect(spy).toHaveBeenCalledTimes(3);
		await user.keyboard('{Shift>}d{/Shift}');
		expect(spy).toHaveBeenCalledTimes(4);

		await user.keyboard('e');
		expect(spy).toHaveBeenCalledTimes(4);
		await user.keyboard('{Control>}{Alt>}{Shift>}e{/Control}{/Alt}{/Shift}');
		expect(spy).toHaveBeenCalledTimes(5);
	});

	test('can be called again to override existing keyboard shortcuts', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy);

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);

		expect(spy).not.toHaveBeenCalled();
		await user.keyboard('a');
		expect(spy).toHaveBeenCalledTimes(1);
		await user.keyboard('b');
		expect(spy).toHaveBeenCalledTimes(1);

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'b' }]);

		await user.keyboard('a');
		expect(spy).toHaveBeenCalledTimes(1);
		await user.keyboard('b');
		expect(spy).toHaveBeenCalledTimes(2);
	});
});
