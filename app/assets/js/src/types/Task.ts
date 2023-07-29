import { TaskStatus } from './TaskStatus.js';

export type Task = {
	id: number;
	name: string;
	status: TaskStatus;

	parent: number | null;
	children: Array<number>;
};
