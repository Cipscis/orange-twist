import { z } from 'zod';
import { isZodSchemaType } from 'util/index';

import { TaskStatus } from 'types/TaskStatus';

const dayTaskSchema = z.object({
	dayName: z.string(),
	taskId: z.number(),

	status: z.nativeEnum(TaskStatus),
	note: z.string(),
});

/**
 * The public interface describing the information stored against a day task.
 */
export type DayTaskInfo = z.infer<typeof dayTaskSchema>;

export const isDayTaskInfo = isZodSchemaType(dayTaskSchema);
