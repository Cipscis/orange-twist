import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { commandsRegister } from '../commandsRegister';
import { registerCommand, unregisterCommand } from '../registerCommand';
import { addCommandListener, removeCommandListener } from './addCommandListener';

describe('addCommandListener', () => {
	beforeEach(() => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Test command' });
	});
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
	});

	test('adds a specified listener to a registered command', () => {
		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy);

		const listeners = commandsRegister.get('__TEST_COMMAND_A__')?.listeners;
		expect(listeners?.size).toBe(1);
		expect(listeners?.has(spy)).toBe(true);
	});

	test('does nothing if the listener is already bound', () => {
		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy);
		addCommandListener('__TEST_COMMAND_A__', spy);

		const listeners = commandsRegister.get('__TEST_COMMAND_A__')?.listeners;
		expect(listeners?.size).toBe(1);
		expect(listeners?.has(spy)).toBe(true);
	});

	test('throws an error if called with an unregistered command', () => {
		expect(() => {
			addCommandListener('__TEST_COMMAND_B__', () => {});
		}).toThrow();
	});

	test('can be called with an AbortSignal, which removes the listener when it is aborted', () => {
		const controller = new AbortController();
		const { signal } = controller;

		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy, { signal });

		let listeners = commandsRegister.get('__TEST_COMMAND_A__')?.listeners;
		expect(listeners?.size).toBe(1);
		expect(listeners?.has(spy)).toBe(true);

		controller.abort();

		listeners = commandsRegister.get('__TEST_COMMAND_A__')?.listeners;
		expect(listeners?.size).toBe(0);
	});

	test('does not bind the listener if called with an already aborted AbortSignal', () => {
		const signal = AbortSignal.abort();

		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy, { signal });

		const listeners = commandsRegister.get('__TEST_COMMAND_A__')?.listeners;
		expect(listeners?.size).toBe(0);
	});
});

describe('removeCommandListener', () => {
	beforeEach(() => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Test command' });
	});
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
	});

	test('removes a specified listener from a command', () => {
		const spy = jest.fn();
		addCommandListener('__TEST_COMMAND_A__', spy);

		let listeners = commandsRegister.get('__TEST_COMMAND_A__')?.listeners;
		expect(listeners?.size).toBe(1);
		expect(listeners?.has(spy)).toBe(true);

		removeCommandListener('__TEST_COMMAND_A__', spy);

		listeners = commandsRegister.get('__TEST_COMMAND_A__')?.listeners;
		expect(listeners?.size).toBe(0);
	});

	test('does nothing if the listener is not bound', () => {
		expect(
			() => {
				removeCommandListener('__TEST_COMMAND_A__', () => {});
			}
		).not.toThrow();
	});

	test('throws an error if called with an unregistered command', () => {
		expect(() => {
			removeCommandListener('__TEST_COMMAND_B__', () => {});
		}).toThrow();
	});
});
