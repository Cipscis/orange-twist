import { z } from 'zod';

import { type PersistApi } from 'persist';
import { isZodSchemaType, loadRegister } from 'utils';


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
export async function loadDayTasks(
	persist: PersistApi,
	serialisedDayTasksInfo?: string
): Promise<void> {
	const options = serialisedDayTasksInfo
		? {
			data: serialisedDayTasksInfo,
		}
		: {
			persist,
			key: 'day-tasks',
		};

	return loadRegister(
		dayTasksRegister,
		isSerialisedDayTasksEntrySchema,
		updateOldDayTaskInfo,
		options
	);
}
