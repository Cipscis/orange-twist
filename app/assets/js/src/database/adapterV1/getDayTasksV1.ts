import { encodeDayTaskKey, type DayTaskInfo } from 'data/dayTasks';

import { getDatabase, getDayName } from '../utils';
import type { LegacyStatusName } from '../types';
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
	const dayTasksV1: DayTaskInfo[] = [];

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.DAY,
		ObjectStoreName.STATUS,
	], 'readonly');

	const allDayTasks = await getDayTasksInternal(transaction);
	const statuses = await getStatusesInternal(transaction);
	for (const dayTask of allDayTasks) {
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

		dayTasksV1.push(dayTaskV1);
	}

	return dayTasksV1.map((dayTask) => [encodeDayTaskKey(dayTask), dayTask]);
}
