import { getNextId, taskRegister } from '../registers/taskRegister.js';
import { TaskStatus } from './TaskStatus.js';

interface TaskOptions {
	name: string;
	startDate: string;
}

export class Task {
	#id: number;
	get id() { return this.#id; }

	#name: string;
	get name() { return this.#name; }

	#statuses: Map<string, TaskStatus>;
	get statuses() { return this.#statuses; }

	#notes: Map<string, string[]>;
	// TODO: Provide methods for dealing with notes instead?
	get notes() { return this.#notes; }

	#tasks: number[];
	// TODO: Provide methods to add and remove subtasks

	constructor(options: TaskOptions) {
		this.#id = getNextId();
		this.#name = options.name;
		this.#statuses = new Map([[options.startDate, TaskStatus.TODO]]);
		this.#notes = new Map();
		this.#tasks = [];

		taskRegister.set(this.#id, this);
	}

	/**
	 * Returns the status of the task on a given day.
	 *
	 * If the specified day was before the start day of the task, returns {@linkcode TaskStatus.TODO}.
	 *
	 * If no day is specified, returns the most recent status of the task.
	 */
	getStatus(day?: string | null): TaskStatus {
		// Create a sorted list of statuses by day
		const statusesByDay = Array.from(this.#statuses.entries())
			.sort(([dayA], [dayB]) => dayA.localeCompare(dayB));

		if (typeof day === 'undefined') {
			// We haven't asked for a particular day, so just get the latest status
			return statusesByDay[statusesByDay.length - 1][1];
		} else {
			let status: TaskStatus = TaskStatus.TODO;

			// Search through days in order until we've reached the requested one
			for (const [day, dayStatus] of statusesByDay) {
				const comparison = day.localeCompare(day);
				if (comparison < 0) {
					// We haven't reached the requested date yet, but keep track
					status = dayStatus;
				} else if (comparison === 0) {
					// We have an exact match, so return this status
					return dayStatus;
				} else {
					// We have passed the requested date, so return whatever we've found
					return status;
				}
			}

			// If we finished the loop before we reached the requested day, return the last status we found.
			return status;
		}
	}
}
