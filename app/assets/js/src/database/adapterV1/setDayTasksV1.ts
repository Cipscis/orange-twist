import type { DayTaskInfo } from 'data/dayTasks';
import { decodeDayTaskKey } from 'data/dayTasks/util';

import {
	addDayTaskInternal,
	getDayByDateInternal,
	getDayTaskForDayAndTaskInternal,
	getDayTasksInternal,
	getStatusByNameInternal,
	getTaskInternal,
} from '../internal';
import { ObjectStoreName } from '../metadata';
import { getDatabase } from '../utils';

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

	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	const promises: (Promise<unknown>)[] = [];

	const priorDayTaskIds = new Set((await getDayTasksInternal(transaction)).map(({ id }) => id));
	// TODO: Collect IDs of day tasks that are added or updated, to find difference with prior day task IDs

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

		const task = await getTaskInternal(taskOS, taskId);
		if (!task) {
			throw new Error(`Cannot add day task, no task exists with ID ${taskId}`);
		}

		const existingDayTask = await getDayTaskForDayAndTaskInternal(transaction, {
			day: day.id,
			task: task.id,
		});

		const status = await getStatusByNameInternal(transaction, dayTask.status);
		if (!status) {
			throw new Error(`Cannot add new day task with status ${dayTask.status} - no such status exists`);
		}

		if (!existingDayTask) {
			// Add new day task
			addDayTaskInternal(transaction, {
				day: day.id,
				task: task.id,
				note: dayTask.note,
				summary: dayTask.summary,
				status: status.id,
			});
			continue;
		}

		// TODO: Update existing day task
	}

	// TODO: Remove removed day tasks

	await Promise.all(promises);
}

// TODO: This function is copied from updateDataV1_0_0
/**
 * Convert a legacy day name into numeric parts. For example, `'2026-04-12'` becomes `[2026, 4, 12]`.
 */
function getDayNameParts(dayName: string): [number, number, number] {
	const parts = dayName.split('-');
	const year = Number(parts[0]);
	const month = Number(parts[1]);
	const day = Number(parts[2]);

	return [year, month, day];
}
