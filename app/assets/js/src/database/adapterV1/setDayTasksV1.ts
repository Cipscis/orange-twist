import type { DayTaskInfo } from 'data/dayTasks';
import { decodeDayTaskKey } from 'data/dayTasks/util';

import {
	addDayTaskInternal,
	getDayByDateInternal,
	getDayTaskForDayAndTaskInternal,
	getDayTasksInternal,
	getStatusByAliasInternal,
	getTaskInternal,
	removeDayTaskInternal,
	updateDayTaskInternal,
} from '../internal';
import { ObjectStoreName } from '../metadata';
import { getDatabase, getDayNameParts } from '../utils';

export async function setDayTasksV1(
	dayTasks: readonly (readonly [string, DayTaskInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.DAY,
		ObjectStoreName.TASK,
		ObjectStoreName.STATUS,
	], 'readwrite');

	const promises: (Promise<unknown>)[] = [];

	const priorDayTaskIds = new Set((await getDayTasksInternal(transaction)).map(({ id }) => id));
	const newDayTaskIds = new Set<number>();

	for (const [dayTaskKey, dayTask] of dayTasks) {
		const { dayName, taskId } = decodeDayTaskKey(dayTaskKey);

		const dayDate = getDayNameParts(dayName);
		const day = await getDayByDateInternal(transaction, {
			year: dayDate[0],
			month: dayDate[1],
			day: dayDate[2],
		});

		if (!day) {
			throw new Error(`Cannot add day task, no day exists with name ${dayName}`);
		}

		const task = await getTaskInternal(transaction, taskId);
		if (!task) {
			throw new Error(`Cannot add day task, no task exists with ID ${taskId}`);
		}

		const existingDayTask = await getDayTaskForDayAndTaskInternal(transaction, {
			day: day.id,
			task: task.id,
		});

		const status = await getStatusByAliasInternal(transaction, dayTask.status);
		if (!status) {
			throw new Error(`Cannot add new day task with status ${dayTask.status} - no such status exists`);
		}

		if (!existingDayTask) {
			// Add new day task
			promises.push(
				addDayTaskInternal(transaction, {
					day: day.id,
					task: task.id,
					note: dayTask.note,
					summary: dayTask.summary,
					status: status.id,
				}).then(
					(newDayTaskId) => newDayTaskIds.add(newDayTaskId)
				)
			);
			continue;
		}

		// Update existing day task
		promises.push(
			updateDayTaskInternal(transaction, {
				day: day.id,
				task: task.id,
				note: dayTask.note,
				summary: dayTask.summary,
				status: status.id,
			}).then(
				(newDayTaskId) => newDayTaskIds.add(newDayTaskId)
			)
		);
	}

	// Wait for newDayTaskIds to be populated
	await Promise.all(promises);

	// Remove removed day tasks
	const removedDayTaskIds = priorDayTaskIds.difference(newDayTaskIds);

	for (const id of removedDayTaskIds) {
		promises.push(removeDayTaskInternal(transaction, id));
	}

	await Promise.all(promises);
}
