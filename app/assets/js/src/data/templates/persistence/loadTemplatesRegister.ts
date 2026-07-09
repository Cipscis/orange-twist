import * as z from 'zod/mini';

import type { PersistApi } from 'persist';
import {
	isZodSchemaType,
	loadRegister,
} from 'utils';

import { StorageKey, type DataSource } from 'data/shared';
import { templatesRegister } from '../templatesRegister';
import { updateOldTemplateInfo } from './updateOldTemplateInfo';

/**
 * Asynchronously loads any persisted templates info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when templates info has finished loading,
 * or rejects when templates info fails to load.
 */
export async function loadTemplatesRegister(
	persist: PersistApi,
	serialisedTemplatesInfo?: string
): Promise<void> {
	const dataSource: DataSource = serialisedTemplatesInfo
		? {
			data: serialisedTemplatesInfo,
		}
		: {
			persist,
			key: StorageKey.TEMPLATES,
		};

	const isValidTemplateEntry = isZodSchemaType(
		z.tuple([z.number(), z.unknown()])
	);

	return loadRegister(
		templatesRegister,
		dataSource,
		isValidTemplateEntry,
		updateOldTemplateInfo,
	);
}
