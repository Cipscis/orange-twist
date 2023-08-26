import { z } from 'zod';

import { TaskStatus } from './TaskStatus.js';

const taskSchema = z.object({
	id: z.number(),
	name: z.string(),
	status: z.nativeEnum(TaskStatus),

	parent: z.nullable(z.number()),
	children: z.array(z.number()),
});

export type Task = z.infer<typeof taskSchema>;
export const isTask = (value: unknown): value is Task => taskSchema.safeParse(value).success;
