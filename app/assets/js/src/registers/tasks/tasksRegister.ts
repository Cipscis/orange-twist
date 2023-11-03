import type { Task } from 'types/Task';
import { TaskStatus } from 'types/TaskStatus';

import type { DeepPartial } from 'util/index';
import { getCurrentDateDayName } from 'util/index';

import { tasksChangeListeners } from './listeners/onTasksChange';
import { loadTasks } from './persistence/loadTasks';
import { getDayData, getDays, removeTaskFromDay, setDayData } from '../days/daysRegister';

const tasksRegister = new Map<number, Task>();
let isInitialised = false;
let loadTasksDataPromise: ReturnType<typeof loadTasksData> | null = null;

let latestId: number = 0;
/**
 * Get a unique numeric ID for a new task.
 */
function getNextId(): number {
	latestId += 1;
	return latestId;
}

/**
 * Load day data once, on first call, and store it in the register.
 *
 * Otherwise, return already stored day data.
 */
export async function loadTasksData(
	options?: { signal: AbortSignal }
): Promise<ReadonlyArray<Readonly<Task>>> {
	if (!isInitialised) {
		if (loadTasksDataPromise) {
			// If a request is still in progress, piggyback on that request
			return loadTasksDataPromise;
		}

		loadTasksDataPromise = new Promise<ReadonlyArray<Readonly<Task>>>((resolve, reject) => {
			if (options?.signal.aborted) {
				reject(options.signal.reason);
			}
			options?.signal.addEventListener('abort', reject);

			loadTasks()
				.then((persistedTasks) => {
					let highestId = -Infinity;
					for (const [taskId, taskData] of persistedTasks) {
						tasksRegister.set(taskId, taskData);
						if (taskId > highestId) {
							highestId = taskId;
						}
					}
					latestId = Math.max(highestId, 0);
					isInitialised = true;

					const tasks = getTasks();
					resolve(tasks);
				})
				.catch(reject);
		});
		return loadTasksDataPromise;
	}

	return getTasks();
}

/**
 * Retrieve all tasks
 */
export function getTasks(): ReadonlyArray<Readonly<Task>> {
	const tasks = Array.from(tasksRegister.entries()).map(([key, value]) => value);

	return tasks;
}

export function getAllTasksData(): ReadonlyArray<[number, Readonly<Task>]> {
	return Array.from(tasksRegister.entries());
}

/**
 * Merge partial task data with existing task data, if present, and fill in any
 * balnks using a set of hard-coded defaults.
 */
function mergeTaskData(id: number, task: Task | null, data: DeepPartial<Omit<Task, 'id'>>): Task {
	const defaultTaskData: Task = {
		id,
		name: '',
		status: TaskStatus.TODO,
	};

	const newData = {
		...defaultTaskData,
		...task,
		...data,
	};

	return newData;
}

/**
 * Retrieve data for a task with a given ID.
 *
 * If no such task exists, returns `null`.
 */
export function getTaskData(id: number): Readonly<Task> | null {
	return tasksRegister.get(id) ?? null;
}

interface SetTaskDataOptions {
	/** A day to associate a set of changes with. If omitted, the current day will be used */
	dayName?: string;
}
/**
 * Set data for a given task. If no task exists
 * with a given ID, this will fail silently.
 */
export function setTaskData(
	id: number,
	data: DeepPartial<Omit<Task, 'id'>>,
	options?: SetTaskDataOptions
): void {
	const task = getTaskData(id);
	if (task === null) {
		return;
	}

	// Create a copy of day data in reverse chronological order
	const days = [...getDays()].reverse();

	const oldTaskData = {
		...task,
	};

	if (options?.dayName) {
		const dayData = days.find(({ dayName }) => dayName === options.dayName);
		if (dayData) {
			const taskDayData = dayData.tasks.find(({ id }) => id === task.id);
			if (taskDayData) {
				oldTaskData.status = taskDayData.status;
			}
		}
	}

	const updatedData = mergeTaskData(id, task, data);

	if (data.status && options?.dayName) {
		// If we're updating a tasks's status for a given day, the current status
		// should only be updated if no more recent status is recorded on another day.
		for (const day of days) {
			if (day.dayName === options.dayName) {
				// If we reach the current day, then there is no more recent status
				// so we can update the data.
				tasksRegister.set(id, updatedData);
				break;
			}

			if (day.tasks.find(({ id }) => id === task.id)) {
				// There is a more recent day with status information, so update
				// the data *except* for status.
				tasksRegister.set(id, {
					...updatedData,
					status: task.status,
				});
				break;
			}
		}
	} else {
		tasksRegister.set(id, updatedData);
	}

	callListeners();

	if (oldTaskData.status !== updatedData.status) {
		const dayName = options?.dayName || getCurrentDateDayName();
		const dayData = getDayData(dayName);
		const dayTasks = dayData?.tasks ?? [];
		const taskData = dayTasks.find(({ id: taskId }) => taskId === id);

		setDayData(
			dayName,
			{
				tasks: [{
					id,
					status: updatedData.status,
					note: taskData?.note ?? null,
				}],
			}
		);
	}
}

/**
 * Delete a task.
 */
export function deleteTask(id: number): void {
	if (tasksRegister.has(id)) {
		tasksRegister.delete(id);
	}

	callListeners();

	const days = getDays();
	for (const day of days) {
		removeTaskFromDay(day.dayName, id);
	}
}

interface AddNewTaskOptions {
	name?: string;
	dayName?: string;
}

/**
 * Add a new task, with default values
 *
 * Returns the ID of the new task
 */
export function addNewTask(name?: string): number
export function addNewTask(options?: AddNewTaskOptions): number
export function addNewTask(options?: string | AddNewTaskOptions): number {
	// First, consolidate arguments
	const name = (() => {
		if (typeof options === 'string') {
			return options;
		}

		return options?.name;
	})();

	const dayName = (() => {
		const days = getDays();
		// If the name of an existing day is specified, use that day
		if (
			typeof options === 'object' &&
			options.dayName &&
			days.find((day) => day.dayName === options.dayName)
		) {
			return options.dayName;
		}

		// Otherwise, use the current day
		const currentDay = days[days.length - 1];
		const currentDayName = currentDay.dayName;

		return currentDayName;
	})();

	const id = getNextId();

	const stub: DeepPartial<Omit<Task, 'id'>> = {};
	if (name) {
		stub.name = name;
	}

	const task: Task = mergeTaskData(id, null, stub);

	tasksRegister.set(id, task);

	setDayData(dayName, {
		tasks: [{
			id: task.id,
			status: task.status,
			note: null,
		}],
	});

	callListeners();

	return task.id;
}

/**
 * Rearranges specified tasks and places them at the end of the map.
 */
export function reorderTasks(ids: number[]): void {
	const reorderedTasks = ids
		.map((id) => getTaskData(id))
		.filter(
			(task): task is NonNullable<typeof task> => Boolean(task)
		);

	for (const task of reorderedTasks) {
		tasksRegister.delete(task.id);
		tasksRegister.set(task.id, task);
	}

	callListeners();
}

function callListeners() {
	const tasks = getTasks();
	for (const listener of tasksChangeListeners) {
		listener(tasks);
	}
}
