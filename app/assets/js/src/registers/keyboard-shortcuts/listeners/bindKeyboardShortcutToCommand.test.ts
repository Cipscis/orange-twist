import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName';
import { registerKeyboardShortcut } from '../registerKeyboardShortcut';

import {
	addCommandListener,
	registerCommand,
	unregisterCommand,
} from 'registers/commands';

import { bindKeyboardShortcutToCommand, unbindKeyboardShortcutFromCommand } from './bindKeyboardShortcutToCommand';
import userEvent from '@testing-library/user-event';

describe('bindKeyboardShortcutToCommand', () => {
	beforeAll(() => {
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);
	});

	beforeEach(() => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Example command' });
	});
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
	});

	test('binds a command to a keyboard shortcut', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__');

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('can be removed by aborting an AbortSignal', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy);

		const controller = new AbortController();
		const { signal } = controller;

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__', { signal });

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
		addCommandListener('__TEST_COMMAND_A__', spy);

		const signal = AbortSignal.abort();

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__', { signal });

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).not.toHaveBeenCalled();
	});

	test('does nothing if command is already bound', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__');
		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__');

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});
});

describe('unbindKeyboardShortcutFromCommand', () => {
	beforeAll(() => {
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);
	});

	beforeEach(() => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Example command' });
	});
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
	});

	test('removes a bound command shortcut listener', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__');

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);

		unbindKeyboardShortcutFromCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__');
		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('does nothing if command is already unbound', () => {
		expect(
			() => unbindKeyboardShortcutFromCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__')
		).not.toThrow();
	});
});
