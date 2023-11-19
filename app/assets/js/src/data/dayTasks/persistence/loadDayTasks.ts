import { z } from 'zod';
import { isZodSchemaType } from 'util/index';

import { dayTaskInfoSchema } from '../types/DayTaskInfo';

import { dayTasksRegister } from '../dayTasksRegister';

const serialisedDayTasksEntrySchema = z.tuple([
	z.custom<`${string}_${number}`>((val) => {
		return typeof val === 'string' &&
		/._\d+$/.test(val);
	}),
	dayTaskInfoSchema,
]);

const isSerialisedDayTasksEntrySchema = isZodSchemaType(serialisedDayTasksEntrySchema);

/**
 * Asynchronously loads any persisted day tasks info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when day tasks info has finished
 * loading, or rejects when day tasks info fails to load.
 */
export async function loadDayTasks(): Promise<void> {
	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	const serialisedDayTasksInfo = localStorage.getItem('day-tasks');

	if (!serialisedDayTasksInfo) {
		return;
	}

	const persistedDayTasksInfo = JSON.parse(serialisedDayTasksInfo) as unknown;

	dayTasksRegister.clear();

	if (!(
		Array.isArray(persistedDayTasksInfo) &&
		persistedDayTasksInfo.every(isSerialisedDayTasksEntrySchema)
	)) {
		throw new Error(`Persisted day tasks data is invalid: ${serialisedDayTasksInfo}`);
	}

	dayTasksRegister.set(persistedDayTasksInfo);
}
