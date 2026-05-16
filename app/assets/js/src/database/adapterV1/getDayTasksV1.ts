import type { DayTaskInfo } from 'data/dayTasks';

import { getStatuses } from '../getStatuses';

import { getDatabase } from 'database/utils';
import type { LegacyStatusName } from 'database/types';
import { ObjectStoreName } from 'database/metadata';
import { getDayInternal, getDayTasksInternal } from 'database/internal';

/**
 * Retrieve all schema v1 {@linkcode DayTaskInfo} information from the database v2.
 */
export async function getDayTasksV1(): Promise<readonly [string, DayTaskInfo][]> {
	const dayTasksV1: DayTaskInfo[] = [];

	const statuses = await getStatuses();

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.DAY,
	], 'readonly');

	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const allDayTasks = await getDayTasksInternal(dayTaskOS);
	for (const dayTask of allDayTasks) {
		// TODO: This non-null assertion isn't safe
		const day = (await getDayInternal(transaction, dayTask.day))!;

		const dayTaskV1: DayTaskInfo = {
			taskId: dayTask.task,
			note: dayTask.note,
			summary: dayTask.summary,
			dayName: `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`,
			// TODO: Make a type-safe way of doing this
			status: statuses[dayTask.status].name as LegacyStatusName,
		};

		dayTasksV1.push(dayTaskV1);
	}

	return dayTasksV1.map((dayTask) => [`${dayTask.dayName}_${dayTask.taskId}`, dayTask]);
}
