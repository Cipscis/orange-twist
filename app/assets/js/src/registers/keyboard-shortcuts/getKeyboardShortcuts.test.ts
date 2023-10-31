import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { KeyboardShortcutName } from './types/index.js';

import { registerKeyboardShortcut } from './registerKeyboardShortcut.js';

import { getKeyboardShortcuts } from './getKeyboardShortcuts.js';

describe('getKeyboardShortcuts', () => {
	test('returns a list of all registered keyboard shortcuts', () => {
		// registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, []);

		expect(getKeyboardShortcuts()).toMatchObject([]);
	});
});
