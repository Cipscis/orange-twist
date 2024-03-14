import { z } from 'zod';
import { isZodSchemaType } from 'utils';

export const dayInfoSchema = z.object({
	name: z.string(),
	note: z.string(),
	tasks: z.array(z.number()).readonly(),
});

/**
 * The public interface describing the information stored against a day.
 */
export type DayInfo = z.infer<typeof dayInfoSchema>;

export const isDayInfo = isZodSchemaType(dayInfoSchema);
