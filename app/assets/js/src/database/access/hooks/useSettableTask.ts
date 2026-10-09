import {
	useCallback,
	useEffect,
} from 'preact/hooks';

import {
	useSettableAsyncData,
	type AsyncDataState,
	type ExpandType,
	type SettableAsyncDataResult,
} from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import type { Task } from '../../types';

import { loadTask } from '../loadTask';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from '../liveAccessManager';
import { SaveType } from '../SaveAction';

/**
 * Attempts to load a specified task immediately, and reloads it if it is changed in the database. Provides a partial {@linkcode AsyncDataState} representing the state of that loading operation and providing a setter method.
 *
 * @see {@linkcode useSettableAsyncData}
 */
export function useSettableTask(taskId: number): ExpandType<
	Omit<SettableAsyncDataResult<Task>, 'getData'>
> {
	const getTask = useCallback(async () => {
		const task = await loadTask(taskId);

		if (task === null) {
			throw new Error(`Could not find task with ID ${taskId}`);
		}

		return task;
	}, [taskId]);

	const setTask = useCallback(async (task: Partial<
		Omit<Task, 'id'>
	>) => {
		await fireCommand(Command.DATA_SAVE, [{
			type: SaveType.TASK,
			id: taskId,
			task,
		}]);
	}, [taskId]);

	const asyncDataResult = useSettableAsyncData({
		getData: getTask,
		setData: setTask,
		optimistic: true,
		immediate: true,
	});

	// Re-fetch the data if it changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addChangeListener(
			ChangeType.CHANGE,
			{ type: ChangeEntityType.TASK, id: taskId },
			asyncDataResult.getData,
			{ signal },
		);

		return () => controller.abort();
	}, [taskId, asyncDataResult.getData]);

	return asyncDataResult;
}
