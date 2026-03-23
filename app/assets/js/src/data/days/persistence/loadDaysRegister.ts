import * as z from 'zod/mini';

import type { PersistApi } from 'persist';
import {
	isZodSchemaType,
	loadRegister,
} from 'utils';

import { StorageKey, type DataSource } from 'data/shared';
import { daysRegister } from '../daysRegister';
import { updateOldDayInfo } from './updateOldDayInfo';

/**
 * Asynchronously loads any persisted days info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when days info has finished loading,
 * or rejects when days info fails to load.
 */
export async function loadDaysRegister(
	persist: PersistApi,
	serialisedDaysInfo?: string
): Promise<void> {
	const dataSource: DataSource = serialisedDaysInfo
		? {
			data: serialisedDaysInfo,
		}
		: {
			persist,
			key: StorageKey.DAYS,
		};

	const isValidDayEntry = isZodSchemaType(
		z.tuple([z.string(), z.unknown()])
	);

	return loadRegister(
		daysRegister,
		dataSource,
		isValidDayEntry,
		updateOldDayInfo,
	);
}
