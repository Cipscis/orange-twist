import { z } from 'zod';

import { TaskStatus } from './TaskStatus';
import { isZodSchemaType } from '../util';

export const taskSchema = z.object({
	id: z.number(),
	name: z.string(),
	status: z.nativeEnum(TaskStatus),
});

export type Task = z.infer<typeof taskSchema>;
export const isTask = isZodSchemaType(taskSchema);
