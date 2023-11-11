import { z } from 'zod';
import { isZodSchemaType } from 'util/index';

import { TaskStatus } from 'types/TaskStatus';

const taskInfoSchema = z.object({
	id: z.number(),
	name: z.string(),
	status: z.nativeEnum(TaskStatus),
});

/**
 * The public interface describing the information stored against a task.
 */
export type TaskInfo = z.infer<typeof taskInfoSchema>;

export const isTaskInfo = isZodSchemaType(taskInfoSchema);
