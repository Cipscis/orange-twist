import {
	getIdbRequestPromise,
	type DefaultsFor,
	type ExpandType,
} from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

import { getDayTaskForDayAndTaskInternal } from './getDayTaskForDayAndTaskInternal';
import { getTaskInternal } from './getTaskInternal';
import { getDayInternal } from './getDayInternal';
import { getStatusInternal } from './getStatusInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to insert a new day task to the day task object store.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY_TASK}, {@linkcode ObjectStoreName.DAY}, {@linkcode ObjectStoreName.TASK}, and {@linkcode ObjectStoreName.STATUS} object stores.
 * @param dayTask The day task object to insert. Any missing properties will be filled with sensible defaults.
 *
 * @returns A {@linkcode Promise} that resolves with the new day task's ID when it has been added.
 *
 * @throws Error if a day task already exists with the specified ID.
 * @throws Error if the day task is linked to a day, task, or status ID that does not exist.
 * @throws TypeError if the database returns a non-number key after adding.
 */
export async function addDayTaskInternal(
	transaction: IDBTransaction,
	dayTask: ExpandType<
		Pick<DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'day' | 'task'> &
		Partial<Omit<DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'id' | 'day' | 'task'>>
	>
): Promise<DatabaseData[typeof ObjectStoreName.DAY_TASK][number]['id']> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const existingDayTask = await getDayTaskForDayAndTaskInternal(transaction, dayTask);
	if (existingDayTask) {
		throw new Error(`Cannot add day task - day task already exists for day ${dayTask.day} and task ${dayTask.task}`);
	}

	const existingDay = await getDayInternal(transaction, dayTask.day);
	if (!existingDay) {
		throw new Error(`Cannot add day task - no day exists with ID ${dayTask.day}`);
	}

	const existingTask = await getTaskInternal(transaction, dayTask.task);
	if (!existingTask) {
		throw new Error(`Cannot add day task - no task exists with ID ${dayTask.task}`);
	}

	const defaults = {
		note: '',
		summary: null,
		status: 1,
		sortIndex: null,
	} as const satisfies DefaultsFor<typeof dayTask>;
	const dayTaskWithDefaults = {
		...defaults,
		...dayTask,
	};

	const status = await getStatusInternal(transaction, dayTaskWithDefaults.status);
	if (!status) {
		throw new Error(`Cannot add day task - no status exists with ID ${dayTaskWithDefaults.status}`);
	}

	const request = dayTaskOS.add(dayTaskWithDefaults);

	const result = await getIdbRequestPromise(request);
	if (!(typeof result === 'number')) {
		throw new TypeError(`The key for a day task should be a number. Received ${JSON.stringify(result, null, '\t')}`);
	}

	return result;
}
