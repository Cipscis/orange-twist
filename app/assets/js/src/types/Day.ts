// Type-only import to make symbol availabe in JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { formatDate } from '../formatters/date';

import { z } from 'zod';

import { taskSchema } from './Task';

import { isZodSchemaType } from '../util';

export const daySchema = z.object({
	/**
	 * A standard string representing a day.
	 *
	 * @see {@linkcode formatDate}
	 */
	dayName: z.string(),
	note: z.string(),

	tasks: z.array(
		taskSchema.pick({
			id: true,
			status: true,
		})
			.extend({
				note: z.string().nullable(),
			})
	),
});

export type Day = z.infer<typeof daySchema>;
export const isDay = isZodSchemaType(daySchema);
