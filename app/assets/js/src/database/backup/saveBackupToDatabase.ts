import { measureAsync } from 'dev/profiling';

import type { TaggedVersionedDatabaseData } from '../types';
import { getDatabase } from '../utils';
import { fillDatabase, updateData } from '../migration';

/**
 * Save a {@linkcode TaggedVersionedDatabaseData} to the database, overwriting any prior data.
 */
export async function saveBackupToDatabase(
	data: TaggedVersionedDatabaseData
): Promise<void> {
	const [updatedData, db] = await Promise.all([
		updateData(data),
		getDatabase(),
	]);

	await measureAsync(
		'fill database',
		() => fillDatabase(db, updatedData),
	);
}
