import type { TaggedLegacyExportData } from '../types';
import { getDatabase } from '../utils';
import { fillDatabase, updateData } from '../migration';

/**
 * Save a {@linkcode TaggedLegacyExportData} to the database, overwriting any prior data.
 */
export async function saveBackupToDatabase(
	data: TaggedLegacyExportData
): Promise<void> {
	const [updatedData, db] = await Promise.all([
		updateData(data),
		getDatabase(),
	]);

	return fillDatabase(db, updatedData);
}
