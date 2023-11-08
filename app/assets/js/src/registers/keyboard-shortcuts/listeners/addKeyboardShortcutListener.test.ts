import {
	beforeAll,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import userEvent from '@testing-library/user-event';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName';
import { registerKeyboardShortcut } from '../registerKeyboardShortcut';
import { getKeyboardShortcut } from '../getKeyboardShortcut';

import { addKeyboardShortcutListener, removeKeyboardShortcutListener } from './addKeyboardShortcutListener';

beforeAll(() => {
	registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);
});

describe('addKeyboardShortcutListener', () => {
	test('can be called before a keyboard shortcut is registered', async () => {
		const user = userEvent.setup();

		const shortcutName = 'Test keyboard shortcut';
		const spy = jest.fn();

		expect(
			() => addKeyboardShortcutListener(
				shortcutName,
				spy
			)
		).not.toThrow();

		const keyboardShortcut = getKeyboardShortcut(shortcutName);
		expect(keyboardShortcut).toEqual({
			name: shortcutName,
			shortcuts: [],
			listeners: [spy],
		});

		registerKeyboardShortcut(shortcutName, [{ key: 'f' }]);

		expect(spy).not.toHaveBeenCalled();
		await user.keyboard('f');
		expect(spy).toHaveBeenCalled();
	});

	test('adds a listener to a keyboard shortcut', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy);

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('can be removed by aborting an AbortSignal', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const controller = new AbortController();
		const { signal } = controller;

		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy, { signal });

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);

		controller.abort();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('does not bind if passed an aborted AbortSignal', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const signal = AbortSignal.abort();

		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy, { signal });

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).not.toHaveBeenCalled();
	});

	test('does nothing if listener is already bound', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy);
		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy);

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});
});

describe('removeKeyboardShortcutListener', () => {
	test('removes a bound keyboard shortcut listener', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy);

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);

		removeKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy);
		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('does nothing if listener is already unbound', () => {
		expect(
			() => removeKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, () => {})
		).not.toThrow();
	});
});
