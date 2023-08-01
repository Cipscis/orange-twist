import { DeepPartial } from '@cipscis/ts-toolbox';

import { Task } from '../../types/Task.js';
import { TaskStatus } from '../../types/TaskStatus.js';

import { tasksChangeListeners } from './listeners/onTasksChange.js';
import { loadTasks } from './persistence/loadTasks.js';

const tasksRegister: Map<number, Task> = new Map();
initialiseTasksRegister();

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
 * Restore persisted data asynchronously.
 */
async function initialiseTasksRegister(): Promise<void> {
	// Restore persisted data
	const persistedData = await loadTasks();
	if (persistedData === null) {
		return;
	}

	// TODO: We need to handle some sort of loading state, to prevent interaction
	let highestId = -Infinity;
	for (const [id, task] of persistedData) {
		tasksRegister.set(id, task);
		if (id > highestId) {
			highestId = id;
		}
	}
	latestId = highestId;

	callListeners();
}

/**
 * Retrieve all tasks
 */
export function getTasks(): ReadonlyArray<Readonly<Task>> {
	const tasks = Array.from(tasksRegister.values());

	return tasks;
}

export function getAllTasksData(): ReadonlyArray<[number, Readonly<Task>]> {
	return Array.from(tasksRegister.entries());
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

	callListeners();
}

/**
 * Add a new task, with default values
 *
 * Returns the ID of the new task
 */
export function addNewTask(name?: string): number {
	const id = getNextId();

	const stub: DeepPartial<Omit<Task, 'id'>> = {};
	if (name) {
		stub.name = name;
	}

	const task: Task = mergeTaskData(id, null, stub);

	tasksRegister.set(id, task);

	callListeners();

	return task.id;
}

function callListeners() {
	const tasks = getTasks();
	for (const listener of tasksChangeListeners) {
		listener(tasks);
	}
}
