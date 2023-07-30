import { DeepPartial } from '@cipscis/ts-toolbox';

import { Task } from '../../types/Task.js';
import { TaskStatus } from '../../types/TaskStatus.js';
import { unfinishedTasksListChangeListeners } from './listeners/onUnfinishedTasksListChange.js';

const tasksRegister: Map<number, Task> = new Map();

let latestId: number = 0;
/**
 * Get a unique numeric ID for a new task.
 */
function getNextId(): number {
	// TODO: This will need to be updated when persisting tasks
	latestId += 1;
	return latestId;
}

/**
 * Retrieve a list of the IDs of all unfinished tasks
 */
export function getUnfinishedTasksList(): ReadonlyArray<Readonly<Task>> {
	const tasks = Array.from(tasksRegister.values());

	const unfinishedTasks = tasks
		.filter(({ status }) => status !== TaskStatus.COMPLETED);

	return unfinishedTasks;
}

/**
 * Retrieve data for a given task, if it exists.
 *
 * If the task doesn't exist, returns `null`.
 */
export function getTaskData(id: number): Readonly<Task> | null {
	const task = tasksRegister.get(id);

	return task ?? null;
}

/**
 * Merge partial task data with existing task data, if present, and fill in any
 * balnks using a set of hard-coded defaults.
 */
function mergeTaskData(id: number, task: Task | null, data: DeepPartial<Omit<Task, 'id'>>): Task {
	const defaultTaskData: Task = {
		id,
		name: 'New task',
		status: TaskStatus.TODO,

		parent: null,
		children: [],
	};

	const newData = {
		...defaultTaskData,
		...task,
		...data,
	};

	return newData;
}

/**
 * Set data for a given task. If no task exists
 * with a given ID, this will fail silently.
 */
export function setTaskData(id: number, data: DeepPartial<Omit<Task, 'id'>>): void {
	const task = getTaskData(id);
	if (task === null) {
		return;
	}

	const updatedData = mergeTaskData(id, task, data);
	tasksRegister.set(id, updatedData);
}

export function addNewTask(name?: string): number {
	const id = getNextId();

	const stub: DeepPartial<Omit<Task, 'id'>> = {};
	if (name) {
		stub.name = name;
	}

	const task: Task = mergeTaskData(id, null, stub);

	console.log({ id, task });
	tasksRegister.set(id, task);

	const unfinishedTasksList = getUnfinishedTasksList();
	for (const listener of unfinishedTasksListChangeListeners) {
		listener(unfinishedTasksList);
	}

	return task.id;
}
