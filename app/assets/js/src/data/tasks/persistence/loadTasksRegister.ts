import * as z from 'zod/mini';

import type { PersistApi } from 'persist';
import {
	isZodSchemaType,
	loadRegister,
} from 'utils';

import { StorageKey, type DataSource } from 'data/shared';
import { tasksRegister } from '../tasksRegister';
import { updateOldTaskInfo } from '../updateOldTaskInfo';

/**
 * Asynchronously loads any persisted tasks info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when tasks info has finished loading,
 * or rejects when tasks info fails to load.
 */
export async function loadTasksRegister(
	persist: PersistApi,
	serialisedTasksInfo?: string
): Promise<void> {
	const dataSource: DataSource = serialisedTasksInfo
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
