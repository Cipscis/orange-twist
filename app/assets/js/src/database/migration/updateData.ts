import { assertAllUnionMembersHandled } from 'utils';

import type { DatabaseData, TaggedLegacyExportData } from '../types';

import { updateDataV1_0_0 } from './updateDataV1_0_0';

/**
 * Update legacy export data to match the current database schema.
 */
export async function updateData(legacyData: TaggedLegacyExportData): Promise<DatabaseData> {
	if (legacyData.schemaVersion === '1.0.0') {
		// Update to v2.0.0
		const updatedData = await updateDataV1_0_0(legacyData.data);
		return updatedData;
	} else if (legacyData.schemaVersion === '2.0.0') {
		// v2.0.0 is the current version
		return legacyData.data;
	} else {
		assertAllUnionMembersHandled(legacyData);
	}
}
