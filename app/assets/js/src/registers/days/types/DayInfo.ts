import { taskSchema } from 'types/Task';
import { z } from 'zod';

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
