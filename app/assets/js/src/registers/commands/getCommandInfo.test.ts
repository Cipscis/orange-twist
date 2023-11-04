import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import { registerCommand, unregisterCommand } from './registerCommand';
import { getCommandInfo } from '.';

describe('getCommandInfo', () => {
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
		unregisterCommand('__TEST_COMMAND_B__');
	});

	test('returns info on all commands if none are specified', () => {
		expect(getCommandInfo()).toEqual([]);

		registerCommand('__TEST_COMMAND_A__', { name: 'Test command A' });

		expect(getCommandInfo()).toEqual([{
			id: '__TEST_COMMAND_A__',
			name: 'Test command A',
			shortcuts: new Set(),
		}]);

		registerCommand('__TEST_COMMAND_B__', { name: 'Test command B' });

		expect(getCommandInfo()).toEqual([
			{
				id: '__TEST_COMMAND_A__',
				name: 'Test command A',
				shortcuts: new Set(),
			},
			{
				id: '__TEST_COMMAND_B__',
				name: 'Test command B',
				shortcuts: new Set(),
			},
		]);
	});

	test('returns null if the specified command is not registered', () => {
		expect(getCommandInfo('__TEST_COMMAND_A__')).toBe(null);
	});

	test('returns info on the specified command if it is registered', () => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Test command A' });

		expect(getCommandInfo('__TEST_COMMAND_A__')).toEqual({
			id: '__TEST_COMMAND_A__',
			name: 'Test command A',
			shortcuts: new Set(),
		});
	});
});
