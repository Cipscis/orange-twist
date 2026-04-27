import type { DayInfo } from 'data/days';
import {
	getDatabase,
	getIdbRequestPromise,
} from 'utils/indexedDB';
import type { DatabaseData } from 'database/types';
import { IndexName, ObjectStoreName } from 'database/metadata';

/**
 * Retrieve all schema v1 {@linkcode DayInfo} information from the database v2.
 */
export async function getDaysV1(): Promise<readonly [string, DayInfo][]> {
	const daysV1: DayInfo[] = [];

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
	], 'readonly');

	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const dayTaskByDay = dayTaskOS.index(IndexName.DAY_TASK_DAY);

	// TODO: Make a type-safe way of doing this
	const allDays = await getIdbRequestPromise(dayOS.getAll() as IDBRequest<DatabaseData['day'][number][]>);
	for (const day of allDays) {
		const dayTasks = await getIdbRequestPromise(
			// TODO: Make a type-safe way of doing this
			dayTaskByDay.getAll(day.id) as IDBRequest<DatabaseData['day_task'][number][]>
		);

		const dayV1: DayInfo = {
			name: `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`,
			note: day.note,
			tasks: dayTasks
				.toSorted((dayTaskA, dayTaskB) => Number(dayTaskA.sortIndex) - Number(dayTaskB.sortIndex))
				.map((dayTask) => dayTask.task),
		};

		daysV1.push(dayV1);
	}

	return daysV1.map((day) => [day.name, day]);
}
