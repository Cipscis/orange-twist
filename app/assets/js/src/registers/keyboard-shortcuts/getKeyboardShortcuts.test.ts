import {
	describe,
	expect,
	test,
} from '@jest/globals';

import type { KeyCombo } from './types';
import { KeyboardShortcutName } from './types';

import { registerKeyboardShortcut } from './registerKeyboardShortcut';
import { addKeyboardShortcutListener } from './listeners/addKeyboardShortcutListener';

import { getKeyboardShortcuts } from './getKeyboardShortcuts';

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
