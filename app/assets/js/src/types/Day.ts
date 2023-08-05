// Type-only import to make symbol availabe in JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { formatDate } from '../formatters/date.js';

import {
	Equivalent,
	Expect,
	hasPropertyOfType,
	isAllOf,
	isArrayOf,
	isObjectWithPropertyOfType,
	isTypeof,
} from '@cipscis/ts-toolbox';

import { TaskStatus, isTaskStatus } from './TaskStatus.js';

export type Day = {
	/**
	 * A standard string representing a day.
	 *
	 * @see {@linkcode formatDate}
	 */
	dayName: string;
	note: string;

	tasks: Array<{
		id: number;
		status: TaskStatus;
	}>
};

export function isDay(data: unknown): data is Day {
	if (typeof data !== 'object' || data === null) {
		return false;
	}

	if (!(hasPropertyOfType(
		data, 'dayName', isTypeof('string')
	))) {
		return false;
	}

	if (!(hasPropertyOfType(
		data, 'note', isTypeof('string')
	))) {
		return false;
	}

	if (!(hasPropertyOfType(
		data, 'tasks', isArrayOf(
			isAllOf(
				isObjectWithPropertyOfType(
					'id', isTypeof('number')
				),
				isObjectWithPropertyOfType(
					'status', isTaskStatus,
				)
			)
		)
	))) {
		return false;
	}

	// This type exists to throw an error if the typeguard gets out of sync with the type
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	type Test = Expect<Equivalent<typeof data, Day>>;

	return true;
}
