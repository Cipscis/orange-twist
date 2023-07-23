import { TaskStatus } from './TaskStatus.js';

export type Task = {
	name: string;
	readonly id: number;
	status: TaskStatus;
	notes: string[];
};
