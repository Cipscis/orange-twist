import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { KeyCombo, KeyboardShortcutName } from './types/index.js';

import { registerKeyboardShortcut } from './registerKeyboardShortcut.js';
import { addKeyboardShortcutListener } from './listeners/addKeyboardShortcutListener.js';

import { getKeyboardShortcuts } from './getKeyboardShortcuts.js';

describe('getKeyboardShortcuts', () => {
	test('returns a list of all registered keyboard shortcuts', () => {
		expect(getKeyboardShortcuts()).toMatchObject([]);

		const keyCombo: KeyCombo = { key: 'a', ctrl: true };
		const fn = () => {};

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [keyCombo]);
		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, fn);

		expect(getKeyboardShortcuts()).toMatchObject([{
			listeners: [fn],
			name: KeyboardShortcutName.DATA_SAVE,
			shortcuts: [keyCombo],
		}]);
	});
});
