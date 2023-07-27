import { formatDate } from '../formatters/date.js';
import { Task } from '../types/Task.js';
import { TaskStatus } from '../types/TaskStatus.js';

export const taskRegister: Map<number, Task> = new Map();

taskRegister.set(1, {
	id: 1,
	name: 'Example task 2',
	currentStatus: TaskStatus.IN_PROGRESS,
	status: new Map([]),

	tasks: [],
	notes: new Map([
		[formatDate(new Date()), ['Example note']],
	]),
});
taskRegister.set(0, {
	id: 0,
	name: 'Example task',
	currentStatus: TaskStatus.TODO,
	status: new Map([]),

	tasks: [],
	notes: new Map(),
});
