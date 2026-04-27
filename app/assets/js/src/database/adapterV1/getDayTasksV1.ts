import type { DayTaskInfo } from 'data/dayTasks';
import type { DatabaseData } from 'data/shared/types';
import { getDatabase, getIdbRequestPromise } from 'utils/indexedDB';
import { getStatuses } from '../getStatuses';
import type { LegacyStatusName } from 'data/shared/types/LegacyExportDataVersions';
import { ObjectStoreName } from 'database/metadata';

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
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);

	// TODO: Make a type-safe way of doing this
	const allDayTasks = await getIdbRequestPromise(dayTaskOS.getAll() as IDBRequest<DatabaseData['day_task'][number][]>);
	for (const dayTask of allDayTasks) {
		// TODO: Make a type-safe way of doing this
		const day = await getIdbRequestPromise(
			dayOS.get(dayTask.day) as IDBRequest<DatabaseData['day'][number]>
		);

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

	console.log(dayTasksV1);
	return dayTasksV1.map((dayTask) => [`${dayTask.dayName}_${dayTask.taskId}`, dayTask]);
}
