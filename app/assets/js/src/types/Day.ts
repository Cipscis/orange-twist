// Type-only import to make symbol availabe in JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { formatDate } from '../formatters/date.js';

import { z } from 'zod';

import { TaskStatus } from './TaskStatus.js';
import { isZodSchemaType } from '../util/isZodSchemaType.js';

const daySchema = z.object({
	/**
	 * A standard string representing a day.
	 *
	 * @see {@linkcode formatDate}
	 */
	dayName: z.string(),
	note: z.string(),

	tasks: z.array(z.object({
		id: z.number(),
		status: z.nativeEnum(TaskStatus),
	})),
});

export type Day = z.infer<typeof daySchema>;
export const isDay = isZodSchemaType(daySchema);
