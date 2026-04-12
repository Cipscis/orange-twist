import * as z from 'zod/mini';

import { legacyStatusNameSchema } from './LegacyStatusName';
import { isZodSchemaType } from 'utils';

export const legacyExportDataSchemaV1_0_0 = z.object({
	schemaVersion: z.literal('1.0.0'),
	days: z.array(
		z.tuple([
			z.string(),
			z.object({
				name: z.string(),
				note: z.string(),
				tasks: z.readonly(z.array(z.number())),
			}),
		]),
	),
	tasks: z.array(
		z.tuple([
			z.number(),
			z.union([
				z.object({
					id: z.number(),
					name: z.string(),
					status: legacyStatusNameSchema,
				}),
				z.object({
					id: z.number(),
					name: z.string(),
					status: legacyStatusNameSchema,
					note: z.string(),
				}),
				z.object({
					id: z.number(),
					name: z.string(),
					status: legacyStatusNameSchema,
					note: z.string(),
					sortIndex: z.number(),
				}),
			]),
		]),
	),
	dayTasks: z.array(
		z.tuple([
			z.stringFormat('dayTask identifier', (val) => /\d{4}-\d{2}-\d{2}_\d+/.test(val)),
			z.union([
				z.object({
					dayName: z.string(),
					taskId: z.number(),
					status: legacyStatusNameSchema,
					note: z.string(),
				}),
				z.object({
					status: legacyStatusNameSchema,
					note: z.string(),
					summary: z.string(),
				}),
			]),
		]),
	),
	templates: z.optional(
		z.array(
			z.tuple([
				z.number(),
				z.object({
					id: z.number(),
					name: z.string(),
					template: z.string(),
					sortIndex: z.number(),
				}),
			]),
		),
	),
	images: z.optional(
		z.array(
			z.tuple([
				z.string(),
				z.union([
					z.url({
						protocol: /^data$/,
					}),
					z.instanceof(Blob),
				]),
			]),
		),
	),
});

export type LegacyExportDataV1_0_0 = z.infer<typeof legacyExportDataSchemaV1_0_0>;

export const isLegacyExportDataV1_0_0 = isZodSchemaType(legacyExportDataSchemaV1_0_0);
