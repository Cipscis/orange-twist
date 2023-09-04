// Type-only import to make symbol availabe in JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { formatDate } from '../formatters/date.js';

import { z } from 'zod';

import { TaskStatus } from './TaskStatus.js';
import { taskSchema } from './Task.js';

import { isZodSchemaType } from '../util/index.js';

export const daySchema = z.object({
	/**
	 * A standard string representing a day.
	 *
	 * @see {@linkcode formatDate}
	 */
	dayName: z.string(),
	note: z.string(),

	tasks: z.array(
		taskSchema.pick({ id: true })
			.and(z.object({
				status: z.nativeEnum(TaskStatus),
			}))
	),
});

export type Day = z.infer<typeof daySchema>;
export const isDay = isZodSchemaType(daySchema);
