import { z } from 'zod';

import { TaskStatus } from './TaskStatus.js';
import { isZodSchemaType } from '../util/index.js';

export const taskSchema = z.object({
	id: z.number(),
	name: z.string(),
	status: z.nativeEnum(TaskStatus),
});

export type Task = z.infer<typeof taskSchema>;
export const isTask = isZodSchemaType(taskSchema);
