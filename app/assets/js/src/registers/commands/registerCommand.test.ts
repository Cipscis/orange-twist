import {
	afterEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { commandsRegister } from './commandsRegister';
import { getCommandInfo } from './getCommandInfo';
import { addCommandListener } from './listeners';

import { registerCommand, unregisterCommand } from './registerCommand';

describe('registerCommand', () => {
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
	});

	test('registers a command', () => {
		expect(
			getCommandInfo('__TEST_COMMAND_A__')
		).toBe(null);

		registerCommand('__TEST_COMMAND_A__', { name: 'Test command' });

		expect(
			getCommandInfo('__TEST_COMMAND_A__')
		).toEqual({
			id: '__TEST_COMMAND_A__',
			name: 'Test command',
			shortcuts: new Set(),
		});
	});

	test('updates a command\'s info if called again, without changing its listeners or shortcuts', () => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Test command' });
		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy);

		expect(
			commandsRegister.get('__TEST_COMMAND_A__')
		).toEqual({
			id: '__TEST_COMMAND_A__',
			name: 'Test command',
			shortcuts: new Set(),
			listeners: new Set([spy]),
		});

		registerCommand('__TEST_COMMAND_A__', { name: 'Test command 2' });

		expect(
			commandsRegister.get('__TEST_COMMAND_A__')
		).toEqual({
			id: '__TEST_COMMAND_A__',
			name: 'Test command 2',
			shortcuts: new Set(),
			listeners: new Set([spy]),
		});

		// TODO: Test keyboard shortcuts are unchanged
	});

	test('can accept an AbortSignal used to unregister the command', () => {
		const controller = new AbortController();
		const { signal } = controller;

		registerCommand(
			'__TEST_COMMAND_A__',
			{ name: 'Test command' },
			{ signal }
		);
		expect(getCommandInfo('__TEST_COMMAND_A__')).not.toBe(null);

		controller.abort();
		expect(getCommandInfo('__TEST_COMMAND_A__')).toBe(null);
	});
});

describe('unregisterCommand', () => {
	test('unregisters a command', () => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Test command' });
		expect(getCommandInfo('__TEST_COMMAND_A__')).not.toBe(null);

		unregisterCommand('__TEST_COMMAND_A__');
		expect(getCommandInfo('__TEST_COMMAND_A__')).toBe(null);
	});

	test('does nothing if called on an unregistered command', () => {
		expect(getCommandInfo('__TEST_COMMAND_A__')).toBe(null);
		expect(
			() => unregisterCommand('__TEST_COMMAND_A__')
		).not.toThrow();
		expect(getCommandInfo('__TEST_COMMAND_A__')).toBe(null);
	});
});
