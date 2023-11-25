import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName';

import {
	onNewKeyboardShortcutRegistered,
	offNewKeyboardShortcutRegistered,
} from './onNewKeyboardShortcutRegistered';
import { registerKeyboardShortcut } from '../registerKeyboardShortcut';

describe('onNewKeyboardShortcutRegistered', () => {
	test('registers a listener to be fired whenever a keyboard shortcut is registered', () => {
		const spy = jest.fn();
		const keyCombo = { key: 'a' };

		onNewKeyboardShortcutRegistered(spy);

		expect(spy).not.toHaveBeenCalled();

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [keyCombo]);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith({
			name: KeyboardShortcutName.DATA_SAVE,
			shortcuts: [keyCombo],
			listeners: [],
		});
	});

	test('can be removed by aborting an AbortSignal', () => {
		const controller = new AbortController();
		const { signal } = controller;

		const spy = jest.fn();

		onNewKeyboardShortcutRegistered(spy, { signal });
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, []);

		expect(spy).toHaveBeenCalledTimes(1);

		controller.abort();

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('doesn\'t bind a listener if an already aborted AbortSignal is passed', () => {
		const signal = AbortSignal.abort();

		const spy = jest.fn();

		onNewKeyboardShortcutRegistered(spy, { signal });
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, []);

		expect(spy).not.toHaveBeenCalled();
	});

	test('does nothing if the same listener is already bound', () => {
		const spy = jest.fn();

		onNewKeyboardShortcutRegistered(spy);
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, []);

		expect(spy).toHaveBeenCalledTimes(1);

		offNewKeyboardShortcutRegistered(spy);

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);

		expect(spy).toHaveBeenCalledTimes(1);
	});
});

describe('offNewKeyboardShortcutRegistered', () => {
	test.todo('unbinds a listener bound with onNewKeyboardShortcutRegistered');

	test('does nothing if the listener is not already bound', () => {
		expect(
			() => offNewKeyboardShortcutRegistered(() => {})
		).not.toThrow();
	});
});
