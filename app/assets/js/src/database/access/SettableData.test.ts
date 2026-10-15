import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { SettableData } from './SettableData';

describe('SettableData', () => {
	describe('updates its internal state', () => {
		test.todo('to an initial state on creation');

		test.todo('to a success state when `setData` is called successfully');

		test.todo('to an error state when `setData` is called and throws an error');
	});

	describe('reports events', () => {
		test.todo('a loadstart event on set start');

		test.todo('a load event on set complete');

		test.todo('an error event on set failure');

		test.todo('an abort event on abort');

		test.todo('a loadend event on load end');
	});

	test.todo('when `setData` is called, calls `setData` function provided as an option');

	describe('aborts the `AbortSignal` passed to `setData`', () => {
		test.todo('when `setData` is called again');

		test.todo('when `abort` is called');

		test.todo('when disposed');
	});
});
