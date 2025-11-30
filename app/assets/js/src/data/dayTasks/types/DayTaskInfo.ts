import * as z from 'zod/mini';
import { isZodSchemaType } from 'utils';

import { TaskStatus } from 'types/TaskStatus';
import { dayTaskIdentifierSchema } from './DayTaskIdentifier';

/**
 * Zod schema for {@linkcode DayTaskInfo}.
 */
export const dayTaskInfoSchema = z.extend(
	dayTaskIdentifierSchema,
	{
		status: z.enum(TaskStatus),
		note: z.string(),
		summary: z.nullable(z.string()),
	},
);

/**
 * The public interface describing the information stored against a day task.
 */
export type DayTaskInfo = z.infer<typeof dayTaskInfoSchema>;

export const isDayTaskInfo = isZodSchemaType(dayTaskInfoSchema);
