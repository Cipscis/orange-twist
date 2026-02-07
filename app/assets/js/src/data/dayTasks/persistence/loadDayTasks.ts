import * as z from 'zod/mini';

import type { PersistApi } from 'persist';
import { isZodSchemaType, loadRegister } from 'utils';

import { StorageKey } from 'data/shared';
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
	const dataSource = serialisedDayTasksInfo
		? {
			data: serialisedDayTasksInfo,
		}
		: {
			persist,
			key: StorageKey.DAY_TASKS,
		};

	return loadRegister(
		dayTasksRegister,
		dataSource,
		isSerialisedDayTasksEntrySchema,
		updateOldDayTaskInfo,
	);
}
