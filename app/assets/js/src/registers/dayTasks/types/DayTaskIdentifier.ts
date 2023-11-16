import { z } from 'zod';

export const dayTaskIdentifierSchema = z.object({
	/** The name of the day this day task is for. */
	dayName: z.string(),
	/** The ID of the task this day task is for. */
	taskId: z.number(),
});

export type DayTaskIdentifier = z.infer<typeof dayTaskIdentifierSchema>;
