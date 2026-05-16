import type { DayInfo } from 'data/days';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { getDaysInternal, getDayTasksForDayInternal } from '../internal';

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

	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const allDays = await getDaysInternal(transaction);
	for (const day of allDays) {
		const dayTasks = await getDayTasksForDayInternal(dayTaskOS, day.id);

		const dayV1: DayInfo = {
			name: `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`,
			note: day.note,
			tasks: dayTasks.map((dayTask) => dayTask.task),
		};

		daysV1.push(dayV1);
	}

	return daysV1.map((day) => [day.name, day]);
}
