import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import userEvent from '@testing-library/user-event';

import { KeyboardShortcutName } from './types/KeyboardShortcutName';
import { addKeyboardShortcutListener } from './listeners/addKeyboardShortcutListener';

import { registerKeyboardShortcut } from './registerKeyboardShortcut';

describe('registerKeyboardShortcut', () => {
	test('sets the key combos that will fire a keyboard shortcut', async () => {
		const user = userEvent.setup();

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [
			{ key: 'a' },
			{ key: 'b', ctrl: true },
			{ key: 'c', alt: true },
			{ key: 'd', shift: true },
			{ key: 'e', ctrl: true, alt: true, shift: true },
		]);

		const controller = new AbortController();
		const { signal } = controller;

		const spy = jest.fn();
		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy, { signal });

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

		controller.abort();
	});

	test('returns the registered information', () => {
		expect(
			registerKeyboardShortcut('Test', [{ key: 'a', alt: true }])
		).toEqual({
			name: 'Test',
			shortcuts: [{ key: 'a', alt: true }],
			listeners: [],
		});
	});

	test('can be called again to override existing keyboard shortcuts', async () => {
		const user = userEvent.setup();

		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);

		const controller = new AbortController();
		const { signal } = controller;

		const spy = jest.fn();
		addKeyboardShortcutListener(KeyboardShortcutName.DATA_SAVE, spy, { signal });

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

		controller.abort();
	});

	test('does not fire when keys are pressed without Ctrl while focus is in a form element', async () => {
		const user = userEvent.setup();

		const inputEl = document.createElement('input');
		inputEl.type = 'text';
		document.body.append(inputEl);

		const selectEl = document.createElement('select');
		document.body.append(selectEl);

		const textareaEl = document.createElement('textarea');
		document.body.append(textareaEl);

		// TODO: Elements that are contentEditable should also behave this way,
		// but jsdom doesn't support contentEditable
		// https://github.com/jsdom/jsdom/issues/1670

		registerKeyboardShortcut('Test shortcut', [
			// Character without Ctrl
			{ key: 'a' },
			// Character with Ctrl
			{ key: 'b', ctrl: true },
			// Special case
			{ key: 'Escape' },
		]);

		const spy = jest.fn();
		addKeyboardShortcutListener('Test shortcut', spy);
		expect(spy).toHaveBeenCalledTimes(0);

		// All shortcuts work with focus on the body
		await user.keyboard('a');
		expect(spy).toHaveBeenCalledTimes(1);
		await user.keyboard('{Control>}b{/Control}');
		expect(spy).toHaveBeenCalledTimes(2);
		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledTimes(3);

		// Character without Ctrl doesn't work when focus is in editable elements
		await user.click(inputEl);
		await user.keyboard('a');
		expect(spy).toHaveBeenCalledTimes(3);
		await user.keyboard('{Control>}b{/Control}');
		expect(spy).toHaveBeenCalledTimes(4);
		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledTimes(5);

		await user.click(selectEl);
		await user.keyboard('a');
		expect(spy).toHaveBeenCalledTimes(5);
		await user.keyboard('{Control>}b{/Control}');
		expect(spy).toHaveBeenCalledTimes(6);
		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledTimes(7);

		await user.click(textareaEl);
		await user.keyboard('a');
		expect(spy).toHaveBeenCalledTimes(7);
		await user.keyboard('{Control>}b{/Control}');
		expect(spy).toHaveBeenCalledTimes(8);
		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledTimes(9);
	});
});
