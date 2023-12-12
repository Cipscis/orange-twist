import { z } from 'zod';

import { assertAllUnionMembersHandled } from 'util/index';

import { TaskStatus } from 'types/TaskStatus';
import { isTaskInfo, type TaskInfo } from './types/TaskInfo';

/**
 * An array of tuples of schema version numbers and definitions,
 * used to match old data against to determine how it needs to
 * be updated.
 */
const oldTaskInfoSchemas = [
	[
		1,
		z.object({
			id: z.number(),
			name: z.string(),
			status: z.nativeEnum(TaskStatus),
		}).strict(),
	],
	[
		2,
		z.object({
			id: z.number(),
			name: z.string(),
			status: z.nativeEnum(TaskStatus),
			note: z.string(),
		}).strict(),
	],
	[
		3,
		z.object({
			id: z.number(),
			name: z.string(),
			status: z.nativeEnum(TaskStatus),
			note: z.string(),
			sortIndex: z.number(),
		}).strict(),
	],
] as const satisfies ReadonlyArray<readonly [number, z.ZodType]>;

/**
 * Use an immediately indexed mapped function to construct a
 * discriminated union of tuple types that can be used to
 * return a linked version number and parsed value from
 * {@linkcode getOldTaskInfoSchemaVersion}.
 */
type GetOldTaskInfoSchemaVersionResult = {
	[K in keyof typeof oldTaskInfoSchemas & number]: [
		typeof oldTaskInfoSchemas[K][0],
		z.infer<typeof oldTaskInfoSchemas[K][1]>
	];
}[keyof typeof oldTaskInfoSchemas & number];

/**
 * Attempts to determine which old task schema version some
 * unknown data matches. If a match is found, returns a tuple
 * of the version number and parsed data.
 *
 * If no match is found, throws an error.
 */
function getOldTaskInfoSchemaVersion(val: unknown): GetOldTaskInfoSchemaVersionResult {
	for (const [version, schema] of oldTaskInfoSchemas) {
		const parsedSchema = schema.safeParse(val);
		if (parsedSchema.success) {
			return [version, parsedSchema.data];
		}
	}

	throw new Error('No valid old task info recognised');
}

/**
 * Attempts to update unknown data to the latest version.
 *
 * If the data doesn't match a previous schema, throws an error.
 */
export function updateOldTaskInfo(val: unknown): TaskInfo {
	// Once we've constructed valid task info, stop updating
	if (isTaskInfo(val)) {
		return val;
	}

	const [oldTaskInfoVersion, oldVal] = getOldTaskInfoSchemaVersion(val);

	let newVal: unknown;
	// Based on the detected old schema version,
	// update the data to the next version
	if (oldTaskInfoVersion === 1) {
		newVal = {
			...oldVal,
			note: '',
		};
	} else if (oldTaskInfoVersion === 2) {
		newVal = {
			...oldVal,
			sortIndex: -1,
		};
	} else if (oldTaskInfoVersion === 3) {
		// No migration currently needed
		newVal = oldVal;
	} else {
		assertAllUnionMembersHandled(oldTaskInfoVersion);
	}

	// Update recursively in case multiple migration steps are needed
	return updateOldTaskInfo(newVal);
}
