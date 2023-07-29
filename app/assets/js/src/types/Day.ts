// Type-only import to make symbol availabe in JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { formatDate } from '../formatters/date.js';

export type Day = {
	/**
	 * A standard string representing a day.
	 *
	 * @see {@linkcode formatDate}
	 */
	date: string;
	note: string;
	sections: Array<{
		name: string;
		// tasks: Array<{
		// 	id: number;
		// 	note: string;
		// 	status: TaskStatus;
		// }>;
	}>;
};
