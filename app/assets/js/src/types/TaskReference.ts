import { TaskStatus } from './TaskStatus.js';

export type TaskReference = {
	readonly id: number;
	status: TaskStatus;
	notes: string[];

	tasks: TaskReference[];
};
