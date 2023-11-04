import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { registerCommand, unregisterCommand } from './registerCommand';
import { fireCommand } from './fireCommand';
import { addCommandListener } from './listeners';

describe('fireCommand', () => {
	beforeEach(() => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Test command' });
	});
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
	});

	test('does nothing if called on an unregistered command', () => {
		expect(() => fireCommand('__TEST_COMMAND_B__')).not.toThrow();
	});

	test('fires all listeners attached to the specified command', () => {
		const spyA = jest.fn();
		const spyB = jest.fn();

		addCommandListener('__TEST_COMMAND_A__', spyA);
		addCommandListener('__TEST_COMMAND_A__', spyB);

		expect(spyA).not.toHaveBeenCalled();
		expect(spyB).not.toHaveBeenCalled();

		fireCommand('__TEST_COMMAND_A__');

		expect(spyA).toHaveBeenCalledTimes(1);
		expect(spyB).toHaveBeenCalledTimes(1);
	});

	test('can be called with or without additional arguments', () => {
		const spy = jest.fn();

		registerCommand('__TEST_COMMAND_A__', { name: 'Test command' });
		addCommandListener('__TEST_COMMAND_A__', spy);

		fireCommand('__TEST_COMMAND_A__');
		expect(spy).toHaveBeenLastCalledWith();

		fireCommand('__TEST_COMMAND_A__', 'argA', true);
		expect(spy).toHaveBeenLastCalledWith('argA', true);
	});
});
