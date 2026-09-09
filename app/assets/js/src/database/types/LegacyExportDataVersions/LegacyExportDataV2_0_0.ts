import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils';

export const legacyExportDataSchemaV2_0_0 = z.object({
	day: z.record(
		z.number(),
		z.object({
			id: z.readonly(z.number()),
			year: z.readonly(z.number()),
			month: z.readonly(z.number()),
			day: z.readonly(z.number()),
			note: z.string(),
		}),
	),
	task: z.record(
		z.number(),
		z.object({
			id: z.readonly(z.number()),
			name: z.string(),
			note: z.string(),
			sortIndex: z.nullable(z.number()),
		}),
	),
	day_task: z.record(
		z.number(),
		z.object({
			id: z.readonly(z.number()),
			day: z.readonly(z.number()),
			task: z.readonly(z.number()),
			note: z.string(),
			summary: z.nullable(z.string()),
			sortIndex: z.nullable(z.number()),
			status: z.number(),
		}),
	),
	status: z.record(
		z.number(),
		z.object({
			id: z.readonly(z.number()),
			/** The legacy alias used for this status in the database v1 */
			alias: z.string(),
			/** A human-readable name for this status, in sentence case */
			name: z.string(),
			/** The filename for an image to use as a mask when representing this task as an icon */
			icon: z.string(),
			/** A CSS colour to use when representing this task as an icon */
			colour: z.string(),
			/** Whether or not a task with this status should be considered "completed" */
			completed: z.boolean(),
		}),
	),
	template: z.record(
		z.number(),
		z.object({
			id: z.readonly(z.number()),
			name: z.string(),
			template: z.string(),
			sortIndex: z.nullable(z.number()),
		}),
	),
	image: z.record(
		z.string(),
		z.object({
			hash: z.readonly(z.string()),
			file: z.instanceof(Blob),
		}),
	),
});

export type LegacyExportDataV2_0_0 = z.infer<typeof legacyExportDataSchemaV2_0_0>;

export const isLegacyExportDataV2_0_0 = isZodSchemaType(legacyExportDataSchemaV2_0_0);
