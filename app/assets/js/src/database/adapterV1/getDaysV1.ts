import type { DayInfo } from 'data/days';

import { getDatabase, getDayName } from '../utils';
import { ObjectStoreName } from '../metadata';
import { getDaysInternal, getDayTasksForDayInternal } from '../internal';

/**
 * Retrieve all schema v1 {@linkcode DayInfo} information from the database v2.
 */
export async function getDaysV1(): Promise<[string, DayInfo][]> {
	const daysV1: DayInfo[] = [];

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
	], 'readonly');

	const allDays = await getDaysInternal(transaction);
	for (const day of allDays) {
		const dayTasks = await getDayTasksForDayInternal(transaction, day.id);

		const dayV1: DayInfo = {
			name: getDayName(day),
			note: day.note,
			tasks: dayTasks.map((dayTask) => dayTask.task),
		};

		daysV1.push(dayV1);
	}

	return daysV1.map((day) => [day.name, day]);
}
