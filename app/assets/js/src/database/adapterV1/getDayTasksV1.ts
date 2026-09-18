import { encodeDayTaskKey, type DayTaskInfo } from 'data/dayTasks';

import { getDatabase, getDayName } from '../utils';
import type {
	DayTask,
	LegacyStatusName,
	Status,
} from '../types';
import { ObjectStoreName } from '../metadata';
import {
	getDayInternal,
	getDayTasksInternal,
	getStatusesInternal,
} from '../internal';

/**
 * Retrieve all schema v1 {@linkcode DayTaskInfo} information from the database v2.
 */
export async function getDayTasksV1(): Promise<readonly [string, DayTaskInfo][]> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.DAY,
		ObjectStoreName.STATUS,
	], 'readonly');

	const allDayTasks = await getDayTasksInternal(transaction);
	const statuses = await getStatusesInternal(transaction);
	const dayTasksV1 = await Promise.all(
		allDayTasks.map(
			(dayTask) => downgradeDayTask(dayTask, statuses, transaction)
		)
	);

	return dayTasksV1.map((dayTask) => [encodeDayTaskKey(dayTask), dayTask]);
}

/**
 * Downgrade a {@linkcode DayTask} from the database v2 into a {@linkcode DayTaskInfo} from the database v1, which includes more specific information about the related day and status.
 */
async function downgradeDayTask(
	dayTask: DayTask,
	statuses: readonly Status[],
	transaction: IDBTransaction,
): Promise<DayTaskInfo> {
	// This non-null assertion is safe because of other controls around what can be inserted into the database
	const day = (await getDayInternal(transaction, dayTask.day))!;

	// This non-null assertion is safe because of other controls around what can be inserted into the database
	const status = statuses.find(({ id }) => id === dayTask.status)!;

	const dayTaskV1: DayTaskInfo = {
		taskId: dayTask.task,
		note: dayTask.note,
		summary: dayTask.summary,
		dayName: getDayName(day),
		// This type assertion is safe because statuses are hard-coded to match legacy status names
		status: status.alias as LegacyStatusName,
	};

	return dayTaskV1;
}
