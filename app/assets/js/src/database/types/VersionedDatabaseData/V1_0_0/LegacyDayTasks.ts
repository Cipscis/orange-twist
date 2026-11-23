import * as z from 'zod/mini';

import { legacyStatusNameSchema } from './LegacyStatusName';

export const legacyDayTasksSchema = z.array(
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
