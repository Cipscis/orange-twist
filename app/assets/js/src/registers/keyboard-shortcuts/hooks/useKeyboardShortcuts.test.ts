import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { renderHook } from '@testing-library/preact';

import { Command } from '../../commands';

import { KeyboardShortcutName } from '../types';
import { registerKeyboardShortcut } from '../registerKeyboardShortcut';
import { bindKeyboardShortcutToCommand } from '../listeners';

import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
	test('provides an array containing info on all keyboard shortcuts', () => {
		const {
			result,
			rerender,
		} = renderHook(() => useKeyboardShortcuts());

		expect(result.current).toMatchObject([]);

		registerKeyboardShortcut(
			KeyboardShortcutName.DATA_SAVE,
			[{ key: 's', ctrl: true }]
		);
		rerender();

		expect(result.current).toMatchObject([{
			name: KeyboardShortcutName.DATA_SAVE,
			shortcuts: [{ key: 's', ctrl: true }],
			listeners: [],
		}]);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);
		// TODO: Re-rendering is not necessary because this mutates the shared `listeners` array
		// Perhaps `listeners` should be removed from the info made available?

		expect(result.current).toMatchObject([{
			name: KeyboardShortcutName.DATA_SAVE,
			shortcuts: [{ key: 's', ctrl: true }],
		}]);
		expect(result.current[0].listeners.length).toBe(1);

		registerKeyboardShortcut(
			KeyboardShortcutName.DATA_SAVE,
			[
				{ key: 's', ctrl: true },
				{ key: 'Enter', ctrl: true },
			]
		);
		rerender();

		expect(result.current).toMatchObject([{
			name: KeyboardShortcutName.DATA_SAVE,
			shortcuts: [
				{ key: 's', ctrl: true },
				{ key: 'Enter', ctrl: true },
			],
		}]);
		expect(result.current[0].listeners.length).toBe(1);
	});
});
