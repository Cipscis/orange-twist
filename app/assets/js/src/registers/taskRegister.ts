import { formatDate } from '../formatters/date.js';
import { Task } from '../types/Task.js';

let nextId: number = 0;

export function getNextId(): number {
	const idToUse = nextId;
	nextId += 1;
	return idToUse;
}

export const taskRegister: Map<number, Task> = new Map();

const exampleTask = new Task({
	name: 'Example task',
	startDate: formatDate(new Date()),
});

exampleTask.notes.set(formatDate(new Date()), ['Example note']);

new Task({
	name: 'Example task 2',
	startDate: formatDate(new Date()),
});

// taskRegister.set(1, {
// 	id: 1,
// 	name: 'Example task 2',
// 	currentStatus: TaskStatus.IN_PROGRESS,
// 	status: new Map([]),

// 	tasks: [],
// 	notes: new Map([
// 		[formatDate(new Date()), ['Example note']],
// 	]),
// });
// taskRegister.set(0, {
// 	id: 0,
// 	name: 'Example task',
// 	currentStatus: TaskStatus.TODO,
// 	status: new Map([]),

// 	tasks: [],
// 	notes: new Map(),
// });
