import { z } from 'zod';
import { isZodSchemaType } from 'utils';

import { ls } from 'persist';

import { dayTasksRegister } from '../dayTasksRegister';
import { updateOldDayTaskInfo } from './updateOldDayTaskInfo';

const serialisedDayTasksEntrySchema = z.tuple([
	z.custom<`${string}_${number}`>((val) => {
		return typeof val === 'string' &&
		/._\d+$/.test(val);
	}),
	z.unknown(),
]);

const isSerialisedDayTasksEntrySchema = isZodSchemaType(serialisedDayTasksEntrySchema);

/**
 * Asynchronously loads any persisted day tasks info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when day tasks info has finished
 * loading, or rejects when day tasks info fails to load.
 */
export async function loadDayTasks(serialisedDayTasksInfo?: string): Promise<void> {
	const persistedDayTasksInfo = await (() => {
		if (typeof serialisedDayTasksInfo !== 'undefined') {
			return JSON.parse(serialisedDayTasksInfo);
		}

		return ls.get('day-tasks');
	})();

	if (typeof persistedDayTasksInfo === 'undefined') {
		dayTasksRegister.clear();
		return;
	}

	if (!(
		Array.isArray(persistedDayTasksInfo) &&
		persistedDayTasksInfo.every(isSerialisedDayTasksEntrySchema)
	)) {
		throw new Error(`Persisted day tasks data is invalid: ${serialisedDayTasksInfo}`);
	}

	const newDayTasksInfo = persistedDayTasksInfo.map(
		([dayTaskKey, dayInfo]) => [dayTaskKey, updateOldDayTaskInfo(dayInfo)] as const
	);

	dayTasksRegister.clear();
	dayTasksRegister.set(newDayTasksInfo);
}
