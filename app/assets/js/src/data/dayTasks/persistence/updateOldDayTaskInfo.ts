import { z } from 'zod';

import { assertAllUnionMembersHandled } from 'util/index';

import { isDayTaskInfo, type DayTaskInfo } from '../types/DayTaskInfo';
import { TaskStatus } from 'types/TaskStatus';

/**
 * An array of tuples of schema version numbers and definitions,
 * used to match old data against to determine how it needs to
 * be updated.
 */
const oldDayTaskInfoSchemas = [
	[
		1,
		z.object({
			dayName: z.string(),
			taskId: z.number(),
			status: z.nativeEnum(TaskStatus),
			note: z.string(),
		}),
	],
	[
		2,
		z.object({
			status: z.nativeEnum(TaskStatus),
			note: z.string(),
			summary: z.string(),
		}),
	],
] as const satisfies ReadonlyArray<readonly [number, z.ZodType]>;

/**
 * Use an immediately indexed mapped function to construct a
 * discriminated union of tuple types that can be used to
 * return a linked version number and parsed value from
 * {@linkcode getOldDayTaskInfoSchemaVersion}.
 */
type GetOldDayTaskInfoSchemaVersionResult = {
	[K in keyof typeof oldDayTaskInfoSchemas & number]: [
		typeof oldDayTaskInfoSchemas[K][0],
		z.infer<typeof oldDayTaskInfoSchemas[K][1]>
	];
}[keyof typeof oldDayTaskInfoSchemas & number];

/**
 * Attempts to determine which old day task schema version some
 * unknown data matches. If a match is found, returns a tuple
 * of the version number and parsed data.
 *
 * If no match is found, throws an error.
 */
function getOldDayTaskInfoSchemaVersion(val: unknown): GetOldDayTaskInfoSchemaVersionResult {
	for (const [version, schema] of oldDayTaskInfoSchemas) {
		const parsedSchema = schema.safeParse(val);
		if (parsedSchema.success) {
			return [version, parsedSchema.data];
		}
	}

	throw new Error('No valid old day task info recognised');
}

/**
 * Attempts to update unknown data to the latest version.
 *
 * If the data doesn't match a previous schema, throws an error.
 */
export function updateOldDayTaskInfo(val: unknown): DayTaskInfo {
	// Once we've constructed valid day task info, stop updating
	if (isDayTaskInfo(val)) {
		return val;
	}

	const [oldDayTaskInfoVersion, oldVal] = getOldDayTaskInfoSchemaVersion(val);

	let newVal: unknown;
	// Based on the detected old schema version,
	// update the data to the next version
	// Based on the detected old schema version,
	// update the data to the next version
	if (oldDayTaskInfoVersion === 1) {
		newVal = {
			...oldVal,
			summary: null,
		};
	} else if (oldDayTaskInfoVersion === 2) {
		// No migration currently needed
		newVal = oldVal;
	} else {
		assertAllUnionMembersHandled(oldDayTaskInfoVersion);
	}

	// Update recursively in case multiple migration steps are needed
	return updateOldDayTaskInfo(newVal);
}
