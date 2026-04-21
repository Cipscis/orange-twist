import type { DayInfo } from 'data/days';
import { IndexName } from 'data/shared/IndexName';
import type { DatabaseData } from 'data/shared/types';
import { sortBySortIndex } from 'utils';
import {
	getDatabase,
	getIdbRequestPromise,
	ObjectStoreName,
} from 'utils/indexedDB';

export async function setDaysV1(
	days: readonly (readonly [string, DayInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.DAY_TASK,
	], 'readwrite');

	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const dayByDate = dayOS.index(IndexName.DAY_DATE);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const dayTaskByDay = dayTaskOS.index(IndexName.DAY_TASK_DAY);
	const dayTaskByDayAndTask = dayTaskOS.index(IndexName.DAY_TASK_DAY_AND_TASK);

	const requests: IDBRequest[] = [];

	for (const [dayName, dayInfo] of days) {
		// TODO: Make a type-safe way of doing this
		const [year, month, day] = getDayNameParts(dayName);
		const keyRange = [year, month, day];

		const existingDay = await getIdbRequestPromise(
			dayByDate.get(keyRange) as IDBRequest<DatabaseData['day'][number]>
		);

		if (existingDay) {
			// Update an existing day note
			requests.push(
				dayOS.put({
					...existingDay,
					note: dayInfo.note,
				})
			);

			const existingDayTasks = sortBySortIndex(await getIdbRequestPromise(
				dayTaskByDay.getAll(existingDay.id) as IDBRequest<DatabaseData['day_task'][number][]>
			));

			const existingDayTasksByTaskId = new Map(
				existingDayTasks.map((dayTask) => ([
					dayTask.task,
					dayTask.id,
				] as const))
			);

			const preDayTaskTaskIds = new Set(
				existingDayTasks.map(({ task }) => task)
			);
			const postDayTaskTaskIds = new Set(dayInfo.tasks);

			const removedDayTaskTaskIds = preDayTaskTaskIds.difference(postDayTaskTaskIds);
			const addedDayTaskTaskIds = postDayTaskTaskIds.difference(preDayTaskTaskIds);
			const remainingDayTaskTaskIds = preDayTaskTaskIds.intersection(postDayTaskTaskIds);

			// Add any new day tasks
			requests.push(
				...Array.from(addedDayTaskTaskIds).map((taskId) => {
					const dayTask = {
						day: existingDay.id,
						task: taskId,
						// TODO - Make sure this is the right initial status
						status: 0,
						note: '',
						summary: '',
						sortIndex: dayInfo.tasks.indexOf(taskId),
					} satisfies Omit<DatabaseData['day_task'][number], 'id'>;

					return dayTaskOS.put(dayTask);
				})
			);

			// Remove any missing day tasks
			requests.push(
				...await Promise.all(
					Array.from(removedDayTaskTaskIds).map(async (taskId) => {
						const existingDayTask = await getIdbRequestPromise(
							// TODO: Find a way to do this with type safety
							dayTaskByDayAndTask.get([existingDay.id, taskId]) as IDBRequest<DatabaseData['day_task'][number]>
						);

						return dayTaskOS.delete(existingDayTask.id);
					})
				)
			);

			// Update sort index of remaining day tasks
			requests.push(
				...await Promise.all(
					Array.from(remainingDayTaskTaskIds).map(async (taskId) => {
						const existingDayTask = await getIdbRequestPromise(
							// TODO: Find a way to do this with type safety
							dayTaskByDayAndTask.get([existingDay.id, taskId]) as IDBRequest<DatabaseData['day_task'][number]>
						);

						return dayTaskOS.put({
							...existingDayTask,
							sortIndex: dayInfo.tasks.indexOf(taskId),
						});
					})
				)
			);
		} else {
			// Create a new day
			requests.push(
				dayOS.put({
					year,
					month,
					day,
					note: dayInfo.note,
				})
			);
		}
	}

	// TODO: Remove any days not in the data

	await Promise.all(requests.map(getIdbRequestPromise));
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
