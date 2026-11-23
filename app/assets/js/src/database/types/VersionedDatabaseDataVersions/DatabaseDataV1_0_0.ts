import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils';

import { legacyStatusNameSchema } from './LegacyStatusName';

// TODO: Move these to a folder and export them separately
const legacyDaysSchema = z.array(
	z.tuple([
		z.string(),
		z.object({
			name: z.string(),
			note: z.string(),
			tasks: z.readonly(z.array(z.number())),
		}),
	]),
);

const legacyTasksSchema = z.array(
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
);

const legacyDayTasksSchema = z.array(
	z.tuple([
		z.stringFormat('dayTask identifier', (val) => /\d{4}-\d{2}-\d{2}_\d+/.test(val)),
		z.union([
			z.object({
				dayName: z.string(),
				taskId: z.number(),
				status: legacyStatusNameSchema,
				note: z.string(),
				summary: z.nullable(z.string()),
			}),
			z.object({
				status: legacyStatusNameSchema,
				note: z.string(),
				summary: z.string(),
			}),
		]),
	]),
);

const legacyTemplatesSchema = z.array(
	z.tuple([
		z.number(),
		z.object({
			id: z.number(),
			name: z.string(),
			template: z.string(),
			sortIndex: z.number(),
		}),
	]),
);

const legacyImageSchema = z.union([
	z.url({
		protocol: /^data$/,
	}),
	z.instanceof(Blob),
]);

export const databaseDataSchemaV1_0_0 = z.object({
	data: z.union([
		z.record(z.string(), z.never()),
		z.object({
			days: legacyDaysSchema,
			tasks: legacyTasksSchema,
			['day-tasks']: legacyDayTasksSchema,
			templates: z.optional(legacyTemplatesSchema),
		}),
	]),
	images: z.optional(
		z.record(
			z.string(),
			legacyImageSchema,
		),
	),
});

export type DatabaseDataV1_0_0 = z.infer<typeof databaseDataSchemaV1_0_0>;

export const isDatabaseDataV1_0_0 = isZodSchemaType(databaseDataSchemaV1_0_0);

// TODO: Move these to their own file
const legacyBackupDataSchemaV1_0_0 = z.object({
	days: legacyDaysSchema,
	tasks: legacyTasksSchema,
	dayTasks: legacyDayTasksSchema,
	templates: z.optional(legacyTemplatesSchema),
	images: z.optional(
		z.array(z.tuple([
			z.string(),
			legacyImageSchema,
		]))
	),
});

export type LegacyBackupDataV1_0_0 = z.infer<typeof legacyBackupDataSchemaV1_0_0>;

export const isLegacyBackupDataV1_0_0 = isZodSchemaType(legacyBackupDataSchemaV1_0_0);
