import { z } from 'zod';

import { assertAllUnionMembersHandled } from 'utils';
import { isTemplateInfo, type TemplateInfo } from '../types/TemplateInfo';

/**
 * An array of tuples of schema version numbers and definitions,
 * used to match old data against to determine how it needs to
 * be updated.
 */
const oldTemplateInfoSchemas = [
	[
		1,
		z.object({
			name: z.string(),
			template: z.string(),
		}).strict(),
	],
] as const satisfies ReadonlyArray<readonly [number, z.ZodType]>;

/**
 * Use an immediately indexed mapped function to construct a
 * discriminated union of tuple types that can be used to
 * return a linked version number and parsed value from
 * {@linkcode getOldTemplateInfoSchemaVersion}.
 */
type GetOldTemplateInfoSchemaVersionResult = {
	[K in keyof typeof oldTemplateInfoSchemas & number]: [
		typeof oldTemplateInfoSchemas[K][0],
		z.infer<typeof oldTemplateInfoSchemas[K][1]>
	];
}[keyof typeof oldTemplateInfoSchemas & number];

/**
 * Attempts to determine which old template schema version some
 * unknown data matches. If a match is found, returns a tuple
 * of the version number and parsed data.
 *
 * If no match is found, throws an error.
 */
function getOldTemplateInfoSchemaVersion(val: unknown): GetOldTemplateInfoSchemaVersionResult {
	for (const [version, schema] of oldTemplateInfoSchemas) {
		const parsedSchema = schema.safeParse(val);
		if (parsedSchema.success) {
			return [version, parsedSchema.data];
		}
	}

	throw new Error('No valid old template info recognised');
}

/**
 * Attempts to update unknown data to the latest version.
 *
 * If the data doesn't match a previous schema, throws an error.
 */
export function updateOldTemplateInfo(val: unknown): TemplateInfo {
	// Once we've constructed valid template info, stop updating
	if (isTemplateInfo(val)) {
		return val;
	}

	const [oldTemplateInfoVersion, oldVal] = getOldTemplateInfoSchemaVersion(val);

	let newVal: unknown;
	// Based on the detected old schema version,
	// update the data to the next version
	// Based on the detected old schema version,
	// update the data to the next version
	if (oldTemplateInfoVersion === 1) {
		// No migration currently needed
		newVal = oldVal;
	} else {
		assertAllUnionMembersHandled(oldTemplateInfoVersion);
	}

	// Update recursively in case multiple migration steps are needed
	return updateOldTemplateInfo(newVal);
}
