import type { DayInfo } from 'data/days';

import type { Day } from '../types';
import { getDatabase, getDayName } from '../utils';
import { ObjectStoreName } from '../metadata';
import { getDaysInternal, getDayTasksForDayInternal } from '../internal';

/**
 * Retrieve all schema v1 {@linkcode DayInfo} information from the database v2.
 */
export async function getDaysV1(): Promise<[string, DayInfo][]> {

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
	], 'readonly');

	const allDays = await getDaysInternal(transaction);
	const daysV1 = await Promise.all(
		allDays.map((day) => downgradeDay(day, transaction))
	);

	return daysV1.map((day) => [day.name, day]);
}

/**
 * Downgrade a {@linkcode Day} from the database v2 into a {@linkcode DayInfo} from the database v1, which includes a list of tasks with day tasks against this day.
 */
async function downgradeDay(
	day: Day,
	transaction: IDBTransaction
): Promise<DayInfo> {
	const dayTasks = await getDayTasksForDayInternal(transaction, day.id);

	const dayV1: DayInfo = {
		name: getDayName(day),
		note: day.note,
		tasks: dayTasks.map((dayTask) => dayTask.task),
	};

	return dayV1;
}
