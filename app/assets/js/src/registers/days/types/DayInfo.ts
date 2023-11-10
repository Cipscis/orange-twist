import { z } from 'zod';
import { isZodSchemaType } from 'util/index';

import { taskSchema } from 'types/Task';

const dayInfoSchema = z.object({
	name: z.string(),
	note: z.string(),

	tasks: z.array(
		taskSchema.pick({
			id: true,
			status: true,
		}).extend({
			note: z.string(),
		})
	),
});

/**
 * The public interface describing the information stored against a day.
 */
export type DayInfo = z.infer<typeof dayInfoSchema>;

export const isDayInfo = isZodSchemaType(dayInfoSchema);
