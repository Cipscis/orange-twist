import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import {
	renderHook,
} from '@testing-library/preact';

import { Command } from '../types/index.js';
import { useCommand } from './index.js';
import { fireCommand } from '../commandsRegister.js';

describe('useCommand', () => {
	test('binds a listener to a command', () => {
		const mockFn = jest.fn();

		const { unmount } = renderHook(() => useCommand(Command.DATA_SAVE, mockFn));

		expect(mockFn).not.toHaveBeenCalled();

		fireCommand(Command.DATA_SAVE);

		expect(mockFn).toHaveBeenCalledTimes(1);

		unmount();
		fireCommand(Command.DATA_SAVE);

		expect(mockFn).toHaveBeenCalledTimes(1);
	});
});
