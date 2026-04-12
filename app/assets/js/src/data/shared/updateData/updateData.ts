import { assertAllUnionMembersHandled } from 'utils';
import type { DatabaseData, LegacyExportData } from '../types';
import { updateDataV1_0_0 } from './updateDataV1_0_0';

/**
 * Update legacy export data to match the current database schema.
 */
export async function updateData(legacyData: LegacyExportData): Promise<DatabaseData> {
	if (legacyData.schemaVersion === '1.0.0') {
		// Update to v2.0.0
		const updatedData = await updateDataV1_0_0(legacyData);
		return updatedData;
	} else if (legacyData.schemaVersion === '2.0.0') {
		return legacyData;
	} else {
		assertAllUnionMembersHandled(legacyData);
	}
}
