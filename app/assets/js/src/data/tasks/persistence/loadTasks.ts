import * as z from 'zod/mini';

import type { PersistApi } from 'persist';
import { isZodSchemaType, loadRegister } from 'utils';

import { StorageKey } from 'data/shared';
import { tasksRegister } from '../tasksRegister';
import { updateOldTaskInfo } from '../updateOldTaskInfo';

/**
 * Asynchronously loads any persisted tasks info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when tasks info has finished loading,
 * or rejects when tasks info fails to load.
 */
export async function loadTasks(
	persist: PersistApi,
	serialisedTasksInfo?: string
): Promise<void> {
	const dataSource = serialisedTasksInfo
		? {
			data: serialisedTasksInfo,
		}
		: {
			persist,
			key: StorageKey.TASKS,
		};

	const isValidTaskEntry = isZodSchemaType(
		z.tuple([z.number(), z.unknown()])
	);

	return loadRegister(
		tasksRegister,
		dataSource,
		isValidTaskEntry,
		updateOldTaskInfo,
	);
}
