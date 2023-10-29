import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { Command } from '../types/Command.js';

import { addCommandListener, removeCommandListener } from './addCommandListener.js';
import { fireCommand } from '../commandsRegister.js';

describe('addCommandListener', () => {
	test('adds a listener that is called when the command is fired', () => {
		const mockFn = jest.fn();
		addCommandListener(Command.DAY_ADD_NEW, mockFn);

		expect(mockFn).not.toHaveBeenCalled();

		fireCommand(Command.DAY_ADD_NEW, '2023-10-28');

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(mockFn).toHaveBeenCalledWith('2023-10-28');

		fireCommand(Command.DAY_ADD_NEW, '2023-10-29');
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test('does nothing if called with an already bound listener', () => {
		const mockFn = jest.fn();
		addCommandListener(Command.DAY_ADD_NEW, mockFn);
		addCommandListener(Command.DAY_ADD_NEW, mockFn);

		expect(mockFn).not.toHaveBeenCalled();

		fireCommand(Command.DAY_ADD_NEW, '2023-10-28');

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(mockFn).toHaveBeenCalledWith('2023-10-28');

		fireCommand(Command.DAY_ADD_NEW, '2023-10-29');
		expect(mockFn).toHaveBeenCalledTimes(2);
	});

	test('allows the listener to be unbound using an AbortSignal', () => {
		const controller = new AbortController();
		const { signal } = controller;

		const mockFn = jest.fn();
		addCommandListener(Command.DATA_SAVE, mockFn, { signal });

		expect(mockFn).not.toHaveBeenCalled();

		fireCommand(Command.DATA_SAVE);

		expect(mockFn).toHaveBeenCalledTimes(1);

		controller.abort();
		fireCommand(Command.DATA_SAVE);

		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test('does not bind the listener if an already aborted AbortSignal is passed', () => {
		const signal = AbortSignal.abort();

		const mockFn = jest.fn();

		addCommandListener(Command.DATA_SAVE, mockFn, { signal });

		expect(mockFn).not.toHaveBeenCalled();

		fireCommand(Command.DATA_SAVE);

		expect(mockFn).toHaveBeenCalledTimes(0);
	});
});

describe('removeCommandListener', () => {
	test('unbinds a listener bound using addCommandListener', () => {
		const mockFn = jest.fn();
		addCommandListener(Command.DATA_SAVE, mockFn);

		expect(mockFn).not.toHaveBeenCalled();

		fireCommand(Command.DATA_SAVE);

		expect(mockFn).toHaveBeenCalledTimes(1);

		removeCommandListener(Command.DATA_SAVE, mockFn);
		fireCommand(Command.DATA_SAVE);

		expect(mockFn).toHaveBeenCalledTimes(1);
	});

	test('does nothing if called with an listener that is not bound', () => {
		const mockFn = jest.fn();
		addCommandListener(Command.DATA_SAVE, mockFn);

		expect(mockFn).not.toHaveBeenCalled();

		removeCommandListener(Command.DATA_SAVE, mockFn);
		fireCommand(Command.DATA_SAVE);

		expect(mockFn).not.toHaveBeenCalled();
	});
});
