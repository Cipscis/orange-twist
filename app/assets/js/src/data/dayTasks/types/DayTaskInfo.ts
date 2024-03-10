import { z } from 'zod';
import { isZodSchemaType } from 'utils';

import { TaskStatus } from 'types/TaskStatus';
import { dayTaskIdentifierSchema } from './DayTaskIdentifier';

/**
 * Zod schema for {@linkcode DayTaskInfo}.
 */
export const dayTaskInfoSchema = dayTaskIdentifierSchema.extend({
	status: z.nativeEnum(TaskStatus),
	note: z.string(),
	summary: z.string().nullable(),
});

/**
 * The public interface describing the information stored against a day task.
 */
export type DayTaskInfo = z.infer<typeof dayTaskInfoSchema>;

export const isDayTaskInfo = isZodSchemaType(dayTaskInfoSchema);
