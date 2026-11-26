import { assertAllUnionMembersHandled } from 'utils';

import type { DatabaseData, TaggedVersionedDatabaseData } from '../types';

import { createMinimalData } from './createMinimalData';
import { updateDataV1_0_0 } from './updateDataV1_0_0';

/**
 * Update versioned database data to match the current database schema.
 */
export async function updateData(data: TaggedVersionedDatabaseData | null): Promise<DatabaseData> {
	if (data === null) {
		const updatedData = createMinimalData();
		return updatedData;
	} else if (data.schemaVersion === '1.0.0') {
		// Update to v2.0.0
		const updatedData = await updateDataV1_0_0(data.data);
		return updatedData;
	} else if (data.schemaVersion === '2.0.0') {
		// v2.0.0 is the current version
		return data.data;
	} else {
		assertAllUnionMembersHandled(data);
	}
}
