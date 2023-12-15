import { z } from 'zod';
import { isZodSchemaType } from 'util/index';

import { TaskStatus } from 'types/TaskStatus';

export const taskInfoSchema = z.object({
	id: z.number(),
	name: z.string(),
	status: z.nativeEnum(TaskStatus),
	note: z.string(),
	/** Used for sorting tasks. */
	sortIndex: z.number(),
	/** The ID of the task's parent, or `null` if it has no parent. */
	parent: z.number().nullable(),
	/** An array of child tasks' IDs. */
	children: z.array(z.number()),
});

/**
 * The public interface describing the information stored against a task.
 */
export type TaskInfo = z.infer<typeof taskInfoSchema>;

export const isTaskInfo = isZodSchemaType(taskInfoSchema);
