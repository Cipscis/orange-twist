import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { act, renderHook } from '@testing-library/preact';

import type { DayTaskIdentifier, DayTaskInfo } from '../types';
import { TaskStatus } from 'types/TaskStatus';

import { dayTasksRegister } from '../dayTasksRegister';
import { setDayTaskInfo } from '../setDayTaskInfo';

import { useDayTaskInfo } from './useDayTaskInfo';

const firstDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 1,

	note: 'Test note',
	status: TaskStatus.IN_PROGRESS,
};

const secondDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-12',
	taskId: 2,

	note: 'Test note 2',
	status: TaskStatus.COMPLETED,
};

const thirdDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 1,

	note: 'Test note 3',
	status: TaskStatus.COMPLETED,
};

const fourthDayTaskInfo: DayTaskInfo = {
	dayName: '2023-11-16',
	taskId: 2,

	note: 'Test note 4',
	status: TaskStatus.COMPLETED,
};

describe('useDayTaskInfo', () => {
	beforeEach(() => {
		dayTasksRegister.clear();
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 1 }, firstDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-12', taskId: 2 }, secondDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-16', taskId: 1 }, thirdDayTaskInfo);
		setDayTaskInfo({ dayName: '2023-11-16', taskId: 2 }, fourthDayTaskInfo);
	});

	describe('when passed no arguments', () => {
		test('if there are no day tasks, returns an empty array', () => {
			dayTasksRegister.clear();

			const { result } = renderHook(() => useDayTaskInfo());
			expect(result.current).toEqual([]);
		});

		test('returns an array of info on all day tasks', () => {
			const { result } = renderHook(() => useDayTaskInfo());

			expect(result.current).toEqual([
				firstDayTaskInfo,
				secondDayTaskInfo,
				thirdDayTaskInfo,
				fourthDayTaskInfo,
			]);
		});
	});

	describe('when passed a complete identifier', () => {
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
	});

	describe('when passed a partial identifier', () => {
		test('returns an array of all matching day tasks', () => {
			const { rerender, result } = renderHook(
				(identifier) => useDayTaskInfo(identifier),
				{
					initialProps: {
						dayName: '2023-11-12',
					} as Partial<DayTaskIdentifier>,
				}
			);
			expect(result.current).toEqual([firstDayTaskInfo, secondDayTaskInfo]);

			rerender({ taskId: 1 });
			expect(result.current).toEqual([firstDayTaskInfo, thirdDayTaskInfo]);
		});

		test('re-renders only when a matching day task is changed', async () => {
			const identifier = {
				dayName: '2023-11-12',
			} as const satisfies Partial<DayTaskIdentifier>;

			let renderCount = 0;
			const { result } = renderHook(() => {
				renderCount += 1;
				return useDayTaskInfo(identifier);
			});

			expect(result.current).toEqual([firstDayTaskInfo, secondDayTaskInfo]);
			expect(renderCount).toBe(1);

			// Updating an unwatched day info shouldn't cause re-renders
			await act(() => setDayTaskInfo({
				dayName: '2023-11-13',
				taskId: 1,
			}, { note: 'New note' }));
			expect(renderCount).toBe(1);

			// Updating a watched day info should cause re-render with new info
			await act(() => setDayTaskInfo({
				...identifier,
				taskId: firstDayTaskInfo.taskId,
			}, { note: 'New note' }));
			expect(result.current).toEqual([
				{
					...firstDayTaskInfo,
					note: 'New note',
				},
				secondDayTaskInfo,
			]);
			expect(renderCount).toBe(2);
		});
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
				} as Partial<DayTaskIdentifier>,
			}
		);
		expect(result.current).toEqual(firstDayTaskInfo);

		rerender({
			dayName: '2023-11-16',
			taskId: 1,
		});
		expect(result.current).toEqual(thirdDayTaskInfo);

		rerender({
			dayName: '2023-11-16',
		});
		expect(result.current).toEqual([thirdDayTaskInfo, fourthDayTaskInfo]);
	});
});
