import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import {
	cleanup,
	renderHook,
	waitFor,
} from '@testing-library/preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { insertTestData } from '../../test-utils';
import type { Status } from '../../types';

import { useStatus } from './useStatus';

describe('useStatus', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide an AsyncDataResult', () => {
		const { result } = renderHook(
			() => useStatus(1)
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useStatus(1)
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Todo',
					alias: 'todo',
					colour: 'var(--blue)',
					icon: 'todo',
					completed: false,
				} satisfies Status,
			});
		});
	});

	test('re-fetches data if provided a new status ID', async () => {
		const { rerender, result } = renderHook(
			(statusId) => useStatus(statusId),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					name: 'Todo',
					alias: 'todo',
					colour: 'var(--blue)',
					icon: 'todo',
					completed: false,
				} satisfies Status,
			});
		});

		rerender(2);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 2,
					name: 'In progress',
					alias: 'in-progress',
					colour: 'var(--blue)',
					icon: 'in progress',
					completed: false,
				} satisfies Status,
			});
		});

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 2,
					name: 'In progress',
					alias: 'in-progress',
					colour: 'var(--blue)',
					icon: 'in progress',
					completed: false,
				} satisfies Status,
			});
		});
	});

	test('enters error state if status could not be found', async () => {
		const { result } = renderHook(
			() => useStatus(-1),
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Could not find status with ID -1'),
				loading: false,
			} satisfies AsyncDataState<Status>);
		});
	});
});
