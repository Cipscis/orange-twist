import { z } from 'zod';

import { assertAllUnionMembersHandled } from 'util/index';
import { isDayInfo, type DayInfo } from '../types/DayInfo';

/**
 * An array of tuples of schema version numbers and definitions,
 * used to match old data against to determine how it needs to
 * be updated.
 */
const oldDayInfoSchemas = [
	[
		1,
		z.object({
			name: z.string(),
			note: z.string(),
			tasks: z.array(z.number()).readonly(),
		}).strict(),
	],
] as const satisfies ReadonlyArray<readonly [number, z.ZodType]>;

/**
 * Use an immediately indexed mapped function to construct a
 * discriminated union of tuple types that can be used to
 * return a linked version number and parsed value from
 * {@linkcode getOldDayInfoSchemaVersion}.
 */
type GetOldDayInfoSchemaVersionResult = {
	[K in keyof typeof oldDayInfoSchemas & number]: [
		typeof oldDayInfoSchemas[K][0],
		z.infer<typeof oldDayInfoSchemas[K][1]>
	];
}[keyof typeof oldDayInfoSchemas & number];

/**
 * Attempts to determine which old day schema version some
 * unknown data matches. If a match is found, returns a tuple
 * of the version number and parsed data.
 *
 * If no match is found, throws an error.
 */
function getOldDayInfoSchemaVersion(val: unknown): GetOldDayInfoSchemaVersionResult {
	for (const [version, schema] of oldDayInfoSchemas) {
		const parsedSchema = schema.safeParse(val);
		if (parsedSchema.success) {
			return [version, parsedSchema.data];
		}
	}

	throw new Error('No valid old day info recognised');
}

/**
 * Attempts to update unknown data to the latest version.
 *
 * If the data doesn't match a previous schema, throws an error.
 */
export function updateOldDayInfo(val: unknown): DayInfo {
	// Once we've constructed valid day info, stop updating
	if (isDayInfo(val)) {
		return val;
	}

	const [oldDayInfoVersion, oldVal] = getOldDayInfoSchemaVersion(val);

	let newVal: unknown;
	// Based on the detected old schema version,
	// update the data to the next version
	// Based on the detected old schema version,
	// update the data to the next version
	if (oldDayInfoVersion === 1) {
		// No migration currently needed
	} else {
		assertAllUnionMembersHandled(oldDayInfoVersion);
	}

	// Update recursively in case multiple migration steps are needed
	return updateOldDayInfo(newVal);
}
