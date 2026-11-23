import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils/isZodSchemaType';

import { legacyDaysSchema } from './LegacyDays';
import { legacyTasksSchema } from './LegacyTasks';
import { legacyDayTasksSchema } from './LegacyDayTasks';
import { legacyTemplatesSchema } from './LegacyTemplates';
import { legacyImageSchema } from './LegacyImage';

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
