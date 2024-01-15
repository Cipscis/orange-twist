import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { act, renderHook } from '@testing-library/preact';

import type { DayTaskIdentifier, DayTaskInfo } from '../types';
import { TaskStatus } from 'types/TaskStatus';

import { clear } from '../../shared';
import { setDayTaskInfo } from '../setDayTaskInfo';

import { useDayTaskInfo } from './useDayTaskInfo';

const firstDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 1,

	status: TaskStatus.IN_PROGRESS,
	note: 'Test note',
	summary: null,
};

const secondDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 2,

	status: TaskStatus.COMPLETED,
	note: 'Test note 2',
	summary: null,
};

const thirdDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 1,

	status: TaskStatus.COMPLETED,
	note: 'Test note 3',
	summary: null,
};

const fourthDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 2,

	status: TaskStatus.COMPLETED,
	note: 'Test note 4',
	summary: null,
};

describe('useDayTaskInfo', () => {
	beforeEach(() => {
		clear();
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 1 }, firstDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 2 }, secondDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-16', taskId: 1 }, thirdDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-16', taskId: 2 }, fourthDayTaskInfo);
	});

	test('if there is no matching day task, returns null', () => {
		const { result } = renderHook(() => useDayTaskInfo({
			dayName: '2023-11-08',
			taskId: 123,
		}));

		expect(result.current).toBeNull();
	});

	test('if there is a matching day task, returns that day task\'s info', () => {
		const { result } = renderHook(() => useDayTaskInfo({
			dayName: '2023-11-12',
			taskId: 1,
		}));

		expect(result.current).toEqual(firstDayTaskInfo);
	});

	test('re-renders only when the matching day task is changed', async () => {
		const identifier = {
			dayName: '2023-11-12',
			taskId: 1,
		} as const satisfies DayTaskIdentifier;

		let renderCount = 0;
		const { result } = renderHook(() => {
			renderCount += 1;
			return useDayTaskInfo(identifier);
		});

		expect(result.current).toEqual(firstDayTaskInfo);
		expect(renderCount).toBe(1);

		// Updating a different day info shouldn't cause re-renders
		await act(() => setDayTaskInfo({
			dayName: '2023-11-13',
			taskId: 3,
		}, { note: 'New note' }));
		expect(renderCount).toBe(1);

		// Updating the watched day info should cause re-render with new info
		await act(() => setDayTaskInfo(identifier, { note: 'New note' }));
		expect(result.current).toEqual({
			...firstDayTaskInfo,
			note: 'New note',
		});
		expect(renderCount).toBe(2);
	});

	test('when the argument changes, returns updated information', () => {
		const {
			rerender,
			result,
		} = renderHook(
			(identifier) => useDayTaskInfo(identifier),
			{
				initialProps: {
					dayName: '2023-11-12',
					taskId: 1,
				} as DayTaskIdentifier,
			}
		);
		expect(result.current).toEqual(firstDayTaskInfo);

		rerender({
			dayName: '2023-11-16',
			taskId: 1,
		});
		expect(result.current).toEqual(thirdDayTaskInfo);
	});
});
