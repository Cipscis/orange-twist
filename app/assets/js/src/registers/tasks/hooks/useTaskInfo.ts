import { useCallback, useEffect, useState } from 'preact/hooks';

import type { TaskInfo } from '../types/TaskInfo';

import { tasksRegister } from '../tasksRegister';
import { getTaskInfo } from '../getTaskInfo';

/**
 * Provides up to date information on all tasks.
 */
export function useTaskInfo(): TaskInfo[];
/**
 * Provides up to date information on a single task.
 *
 * @param taskId The name of the specified task.
 */
export function useTaskInfo(taskId: number): TaskInfo | null;
export function useTaskInfo(taskId?: number): TaskInfo[] | TaskInfo | null {
	const getThisDayInfo = useCallback(() => {
		if (taskId) {
			return getTaskInfo(taskId);
		} else {
			return getTaskInfo();
		}
	}, [taskId]);

	const [dayInfo, setDayInfo] = useState(getThisDayInfo);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		tasksRegister.addEventListener(
			'set',
			() => setDayInfo(getThisDayInfo()),
			{ signal }
		);

		tasksRegister.addEventListener(
			'delete',
			() => setDayInfo(getThisDayInfo()),
			{ signal }
		);

		return () => controller.abort();
	}, [getThisDayInfo]);

	return dayInfo;
}
