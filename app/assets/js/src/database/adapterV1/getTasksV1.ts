import type { TaskInfo } from 'data/tasks';

import { getDatabase, sortDaysChronologically } from '../utils';
import type {
	Day,
	DayTask,
	LegacyStatusName,
	Status,
	Task,
} from '../types';
import { ObjectStoreName } from '../metadata';
import {
	getDaysInternal,
	getDayTasksInternal,
	getStatusesInternal,
	getTasksInternal,
} from '../internal';

/**
 * Retrieve all schema v1 {@linkcode TaskInfo} information from the database v2.
 */
export async function getTasksV1(): Promise<readonly [number, TaskInfo][]> {
	const tasksV1: TaskInfo[] = [];

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TASK,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.DAY,
		ObjectStoreName.STATUS,
	], 'readonly');

	const [
		allTasks,
		allDays,
		allDayTasks,
		statuses,
	] = await Promise.all([
		getTasksInternal(transaction),
		getDaysInternal(transaction),
		getDayTasksInternal(transaction),
		getStatusesInternal(transaction),
	]);

	for (const task of allTasks) {
		const taskV1 = downgradeTask({
			task,
			allDays,
			allDayTasks,
			statuses,
		});

		tasksV1.push(taskV1);
	}

	return tasksV1.map((task) => [task.id, task]);
}

/**
 * Downgrade a {@linkcode Task} from the database v2 to a {@linkcode TaskInfo} from the database v1, which includes a separate status record.
 */
function downgradeTask({
	task,
	allDays,
	allDayTasks,
	statuses,
}: {
	task: Task;
	allDays: readonly Day[];
	allDayTasks: readonly DayTask[];
	statuses: readonly Status[];
}): TaskInfo {
	const status = getStatusForTask({
		task,
		allDays,
		allDayTasks,
		statuses,
	});

	const taskV1: TaskInfo = {
		id: task.id,
		name: task.name,
		note: task.note,
		sortIndex: task.sortIndex ?? 0,
		// This type assertion is safe because statuses are hard-coded to match legacy status names
		status: status.alias as LegacyStatusName,
	};

	return taskV1;
}

/**
 * Tasks don't have statuses recorded on them directly. Instead, a task's current status is derived by its latest day task. If a task has no day tasks, then it uses the default status.
 *
 * This function looks at a task's day tasks, and determines which status it should be considered to have.
 */
function getStatusForTask({
	task,
	allDays,
	allDayTasks,
	statuses,
}: {
	task: Task;
	allDays: readonly Day[];
	allDayTasks: readonly DayTask[];
	statuses: readonly Status[];
}) {
	// Find task status via the task's most recent day task
	const dayTasks = allDayTasks.filter(
		({ task: taskId }) => taskId === task.id
	);

	const daysById = new Map<number, Day>();
	for (const day of allDays) {
		daysById.set(day.id, day);
	}

	const sortedDayTasks = dayTasks.toSorted(
		(dayTaskA, dayTaskB) => {
			const dayA = daysById.get(dayTaskA.day);
			const dayB = daysById.get(dayTaskB.day);

			if (!(dayA && dayB)) {
				throw new Error(`Couldn't find both days ${dayTaskA.day} and ${dayTaskB.day}`);
			}

			return sortDaysChronologically(dayA, dayB);
		}
	);
	const lastDayTask = sortedDayTasks.at(-1);

	// Fall back to the default status at ID 1
	const statusId = lastDayTask?.status ?? 1;

	const status = statuses.find(({ id }) => id === statusId);

	if (!status) {
		throw new Error(`Could not find status with ID ${statusId}`);
	}
	return status;
}
