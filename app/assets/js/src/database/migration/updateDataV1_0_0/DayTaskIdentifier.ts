import * as z from 'zod/mini';
import { isZodSchemaType } from 'utils';

export const dayTaskIdentifierSchema = z.object({
	/** The name of the day this day task is for. */
	dayName: z.string(),
	/** The ID of the task this day task is for. */
	taskId: z.number(),
});

export type DayTaskIdentifier = z.infer<typeof dayTaskIdentifierSchema>;
export const isDayTaskIdentifier = isZodSchemaType(dayTaskIdentifierSchema);
