import {
	getIdbRequestPromise,
	type DefaultsFor,
	type ExpandType,
} from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

import { getDayTaskForDayAndTaskInternal } from './getDayTaskForDayAndTaskInternal';
import { getTaskInternal } from './getTaskInternal';
import { getDayInternal } from './getDayInternal';
import { getStatusInternal } from './getStatusInternal';

export async function addDayTaskInternal(
	dayTaskOS: IDBObjectStore,
	dayOS: IDBObjectStore,
	taskOS: IDBObjectStore,
	statusOS: IDBObjectStore,
	dayTask: ExpandType<
		Pick<DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'day' | 'task'> &
		Partial<Omit<DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'id' | 'day' | 'task'>>
	>
): Promise<DatabaseData[typeof ObjectStoreName.DAY_TASK][number]['id']> {
	const existingDayTask = await getDayTaskForDayAndTaskInternal(dayTaskOS, dayTask);
	if (existingDayTask) {
		throw new Error(`Cannot add day task - day task already exists for day ${dayTask.day} and task ${dayTask.task}`);
	}

	const existingDay = await getDayInternal(dayOS, dayTask.day);
	if (!existingDay) {
		throw new Error(`Cannot add day task - no day exists with ID ${dayTask.day}`);
	}

	const existingTask = await getTaskInternal(taskOS, dayTask.task);
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

	const status = await getStatusInternal(statusOS, dayTaskWithDefaults.status);
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
