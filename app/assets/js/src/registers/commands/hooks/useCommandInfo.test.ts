import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import { act, renderHook } from '@testing-library/preact';

import { useCommandInfo } from './useCommandInfo';
import { registerCommand, unregisterCommand } from '../registerCommand';

describe('useCommandInfo', () => {
	beforeEach(() => {
		registerCommand('__TEST_COMMAND_A__', { name: 'Command A' });
	});
	afterEach(() => {
		unregisterCommand('__TEST_COMMAND_A__');
		unregisterCommand('__TEST_COMMAND_B__');
	});

	test('if no arguments passed, provides up to date information about all commands', async () => {
		const { result } = renderHook(
			() => useCommandInfo()
		);

		expect(result.current).toEqual([{
			id: '__TEST_COMMAND_A__',
			name: 'Command A',
			shortcuts: new Set(),
		}]);

		await act(() => registerCommand('__TEST_COMMAND_B__', { name: 'Command B' }));

		expect(result.current).toEqual([
			{
				id: '__TEST_COMMAND_A__',
				name: 'Command A',
				shortcuts: new Set(),
			},
			{
				id: '__TEST_COMMAND_B__',
				name: 'Command B',
				shortcuts: new Set(),
			},
		]);

		await act(() => registerCommand('__TEST_COMMAND_A__', { name: 'New name' }));

		expect(result.current).toEqual([
			{
				id: '__TEST_COMMAND_A__',
				name: 'New name',
				shortcuts: new Set(),
			},
			{
				id: '__TEST_COMMAND_B__',
				name: 'Command B',
				shortcuts: new Set(),
			},
		]);
	});

	test('if a command is specified, provides up to date information about that command', async () => {
		const { result } = renderHook(
			() => useCommandInfo('__TEST_COMMAND_A__')
		);

		expect(result.current).toEqual({
			id: '__TEST_COMMAND_A__',
			name: 'Command A',
			shortcuts: new Set(),
		});

		await act(() => registerCommand('__TEST_COMMAND_A__', { name: 'New name' }));

		expect(result.current).toEqual({
			id: '__TEST_COMMAND_A__',
			name: 'New name',
			shortcuts: new Set(),
		});

		await act(() => unregisterCommand('__TEST_COMMAND_A__'));

		expect(result.current).toBe(null);
	});
});
