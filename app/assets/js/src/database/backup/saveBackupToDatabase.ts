import { nextFrame } from 'utils/nextFrame';

import { measureAsync } from 'dev/profiling';

import type { TaggedVersionedDatabaseData } from '../types';
import { getDatabase } from '../utils';
import { fillDatabase, updateData } from '../migration';

/**
 * Save a {@linkcode TaggedVersionedDatabaseData} to the database, overwriting any prior data.
 */
export async function saveBackupToDatabase(
	data: TaggedVersionedDatabaseData,
	reportProgress: (progress: number) => void,
): Promise<void> {
	reportProgress?.(0);
	await nextFrame();

	const [updatedData, db] = await Promise.all([
		updateData(data, reportProgress),
		getDatabase(),
	]);

	await measureAsync(
		'fill database',
		() => fillDatabase(db, updatedData),
	);
}
