// Type-only import to expose the symbol for use in JSDoc comments
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { dayRegister } from '../registers/dayRegister.js';

import { TaskStatus } from './TaskStatus.js';

export type Task = {
	name: string;
	readonly id: number;
	currentStatus: TaskStatus;
	/**
	 * A map between day strings and statuses. The keys should
	 * align with keys of {@linkcode dayRegister}.
	 */
	status: Map<string, TaskStatus>;

	tasks: number[];

	/**
	 * A map between day strings and notes. The keys should
	 * align with keys of {@linkcode dayRegister}.
	 */
	notes: Map<string, string[]>;
};
