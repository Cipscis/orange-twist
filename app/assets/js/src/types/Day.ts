import { TaskReference } from './TaskReference.js';

export type Day = {
	date: Date;
	tasks: TaskReference[];
};
