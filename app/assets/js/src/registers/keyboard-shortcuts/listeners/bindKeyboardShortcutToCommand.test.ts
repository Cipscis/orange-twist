import {
	beforeAll,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { KeyboardShortcutName } from '../types/KeyboardShortcutName';
import { registerKeyboardShortcut } from '../registerKeyboardShortcut';

import {
	Command,
	addCommandListener,
	registerCommand,
} from '../../commands';

import { bindKeyboardShortcutToCommand, unbindKeyboardShortcutFromCommand } from './bindKeyboardShortcutToCommand';
import userEvent from '@testing-library/user-event';

beforeAll(() => {
	registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 'a' }]);
	registerCommand({
		id: Command.DATA_SAVE,
		name: 'Example command',
	});
});

describe('bindKeyboardShortcutToCommand', () => {
	test('binds a command to a keyboard shortcut', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();
		addCommandListener(Command.DATA_SAVE, spy);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('can be removed by aborting an AbortSignal', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();
		addCommandListener(Command.DATA_SAVE, spy);

		const controller = new AbortController();
		const { signal } = controller;

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE, { signal });

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
		addCommandListener(Command.DATA_SAVE, spy);

		const signal = AbortSignal.abort();

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE, { signal });

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).not.toHaveBeenCalled();
	});

	test('does nothing if command is already bound', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();
		addCommandListener(Command.DATA_SAVE, spy);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);
		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});
});

describe('unbindKeyboardShortcutFromCommand', () => {
	test('removes a bound command shortcut listener', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();
		addCommandListener(Command.DATA_SAVE, spy);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);

		unbindKeyboardShortcutFromCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);
		await user.keyboard('a');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('does nothing if command is already unbound', () => {
		expect(
			() => unbindKeyboardShortcutFromCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE)
		).not.toThrow();
	});
});
