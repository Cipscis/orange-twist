import { z } from 'zod';
import { isZodSchemaType } from 'util/index';

// TODO: Is there a better way to couple these together?
import { taskInfoSchema } from 'registers/tasks/types/TaskInfo';

const dayInfoSchema = z.object({
	name: z.string(),
	note: z.string(),

	tasks: z.array(
		taskInfoSchema.pick({
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
