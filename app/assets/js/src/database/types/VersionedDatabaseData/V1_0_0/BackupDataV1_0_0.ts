import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils/isZodSchemaType';

import { legacyDaysSchema } from './LegacyDays';
import { legacyTasksSchema } from './LegacyTasks';
import { legacyDayTasksSchema } from './LegacyDayTasks';
import { legacyTemplatesSchema } from './LegacyTemplates';
import { legacyImageSchema } from './LegacyImage';

const backupDataSchemaV1_0_0 = z.object({
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

export type BackupDataV1_0_0 = z.infer<typeof backupDataSchemaV1_0_0>;

export const isBackupDataV1_0_0 = isZodSchemaType(backupDataSchemaV1_0_0);
