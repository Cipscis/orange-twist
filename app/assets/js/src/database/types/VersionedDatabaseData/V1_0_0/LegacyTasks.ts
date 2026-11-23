import * as z from 'zod/mini';

import { legacyStatusNameSchema } from './LegacyStatusName';

export const legacyTasksSchema = z.array(
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
