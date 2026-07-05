import type { LegacyExportDataByVersion, LegacyStatusName } from '../types';

/**
 * Collect status data suitable for schema version `2.0.0` from schema version `1.0.0` data.
 */
export function collectStatusData(
	legacyData?: Readonly<LegacyExportDataByVersion<'1.0.0'>>
): LegacyExportDataByVersion<'2.0.0'>['status'] {
	// Collect statuses in data set, starting with defaults
	const statusSet = new Set<string>([
		'todo',
		'in-progress',
		'completed',

		'investigating',
		'in-review',
		'ready-to-test',
		'paused',
		'approved-to-deploy',
		'will-not-do',
	] satisfies LegacyStatusName[]);

	// Add any statuses that appear in task or day task data
	if (legacyData) {
		for (const [, { status }] of (legacyData.data.tasks ?? [])) {
			statusSet.add(status);
		}
		for (const [, { status }] of (legacyData.data['day-tasks'] ?? [])) {
			statusSet.add(status);
		}
	}

	return Array.from(statusSet)
		.map((alias, id) => ({
			id: id + 1, // IndexedDB IDs start from 1, so increment here to match,
			alias,
		}));
}
