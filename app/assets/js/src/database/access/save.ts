import { assertAllUnionMembersHandled, getCurrentDate } from 'utils';

import { ObjectStoreName } from '../metadata';
import { getDayNameParts } from '../utils';
import {
	addDayInternal,
	addDayTaskInternal,
	addTaskInternal,
	getDayByDateInternal,
	getDayTaskForDayAndTaskInternal,
	getDayTaskInternal,
	removeDayInternal,
	removeDayTaskInternal,
	removeTaskInternal,
	updateDayInternal,
	updateDayTaskInternal,
	updateTaskInternal,
} from '../internal';

import { SaveType, type SaveAction } from './SaveAction';
import { requestTransaction } from './requestTransaction';
import {
	ChangeEntityType,
	ChangeType,
	noticeChange,
	noticeListChange,
} from './liveAccessManager';

/**
 * Process any number of {@linkcode SaveAction}s.
 */
export async function save(actions: readonly SaveAction[]): Promise<void> {
	if (actions.length === 0) {
		return;
	}

	const objectStores = gatherTransactionRequirements(actions);
	const transaction = await requestTransaction(objectStores, 'readwrite');

	for (const action of actions) {
		if (action.type === SaveType.TASK) {
			saveTask(action, transaction);
		} else if (action.type === SaveType.TASK_STATUS) {
			setTaskStatus(action, transaction);
		} else if (action.type === SaveType.TASK_STATUS_FOR_DATE) {
			setTaskStatusForDate(action, transaction);
		} else if (action.type === SaveType.TASK_ADD) {
			addTask(action, transaction);
		} else if (action.type === SaveType.TASK_ADD_WITH_DAY) {
			addNewTaskToDay(action, transaction);
		} else if (action.type === SaveType.TASK_DELETE) {
			deleteTask(action, transaction);
		} else if (action.type === SaveType.DAY_TASK_LEGACY) {
			saveDayTaskLegacy(action, transaction);
		} else if (action.type === SaveType.DAY_TASK) {
			saveDayTask(action, transaction);
		} else if (action.type === SaveType.DAY_TASK_ADD) {
			addDayTask(action, transaction);
		} else if (action.type === SaveType.DAY_TASK_DELETE) {
			deleteDayTask(action, transaction);
		} else if (action.type === SaveType.DAY) {
			saveDay(action, transaction);
		} else if (action.type === SaveType.DAY_ADD) {
			addDay(action, transaction);
		} else if (action.type === SaveType.DAY_DELETE) {
			deleteDay(action, transaction);
		} else {
			assertAllUnionMembersHandled(action);
		}
	}
}

/**
 * Save data against a single task.
 */
async function saveTask(
	action: Extract<
		SaveAction, { type: typeof SaveType.TASK; }
	>,
	transaction: IDBTransaction
): Promise<void> {
	// Protect against extraneous and undefined properties
	const taskToSave: Parameters<typeof updateTaskInternal>[1] = {
		id: action.id,
	};
	if (typeof action.task.name !== 'undefined') {
		taskToSave.name = action.task.name;
	}
	if (typeof action.task.note !== 'undefined') {
		taskToSave.note = action.task.note;
	}
	if (typeof action.task.sortIndex !== 'undefined') {
		taskToSave.sortIndex = action.task.sortIndex;
	}

	await updateTaskInternal(transaction, taskToSave);
	noticeChange(ChangeEntityType.TASK, action.id);
}

/**
 * Sets the status for a task. This is saved to a day task against this task and the current day. This operation will try to create the current day if it doesn't already exist, and may also involve creating a day task.
 */
async function setTaskStatus(
	action: Extract<
		SaveAction, { type: typeof SaveType.TASK_STATUS; }
	>,
	transaction: IDBTransaction
): Promise<void> {
	// Try to get the current day
	const currentDate = getCurrentDate();

	await setTaskStatusForDate({
		type: SaveType.TASK_STATUS_FOR_DATE,
		id: action.id,
		status: action.status,
		day: currentDate,
	}, transaction);
}

/**
 * Sets the status for a task against a specified date. This is saved to a day task against this task and the day for the specified date. This operation will try to create a day for the specified date if it doesn't already exist, and may also involve creating a day task.
 */
async function setTaskStatusForDate(
	action: Extract<
		SaveAction, { type: typeof SaveType.TASK_STATUS_FOR_DATE; }
	>,
	transaction: IDBTransaction
): Promise<void> {
	// Try to get the current day
	let todayId = (await getDayByDateInternal(transaction, action.day))?.id ?? null;

	if (todayId === null) {
		// If today doesn't exist, create it
		todayId = await addDay({
			type: SaveType.DAY_ADD,
			day: {
				...action.day,
				note: '',
			},
		}, transaction);
	}

	// Try to get the day task for this task today
	const dayTask = await getDayTaskForDayAndTaskInternal(transaction, {
		day: todayId,
		task: action.id,
	});

	if (dayTask) {
		// If the day task already exists, apply the right status
		await saveDayTask({
			type: SaveType.DAY_TASK,
			id: dayTask.id,
			dayTask: { status: action.status },
		}, transaction);
		return;
	}

	// Otherwise, create a new day task with the right status
	await addDayTask({
		type: SaveType.DAY_TASK_ADD,
		dayTask: {
			day: todayId,
			task: action.id,
			status: action.status,
		},
	}, transaction);
}

/**
 * Adds a single task.
 */
async function addTask(
	action: Extract<
		SaveAction, { type: typeof SaveType.TASK_ADD; }
	>,
	transaction: IDBTransaction
): Promise<number> {
	const taskId = await addTaskInternal(transaction, action.task);

	noticeListChange(ChangeEntityType.TASK);
	noticeChange(ChangeEntityType.TASK, taskId);

	return taskId;
}

/**
 * Adds a single task, and a day task for a specified day.
 */
async function addNewTaskToDay(
	action: Extract<
		SaveAction, { type: typeof SaveType.TASK_ADD_WITH_DAY; }
	>,
	transaction: IDBTransaction
): Promise<void> {
	const taskId = await addTask({
		type: SaveType.TASK_ADD,
		task: action.task,
	}, transaction);

	await addDayTask({
		type: SaveType.DAY_TASK_ADD,
		dayTask: {
			day: action.dayId,
			task: taskId,
		},
	}, transaction);
}

/**
 * Delete a single task, and any day tasks referencing it.
 */
async function deleteTask(
	action: Extract<
		SaveAction, { type: typeof SaveType.TASK_DELETE; }
	>,
	transaction: IDBTransaction
): Promise<void> {
	const deletedDayTaskIds = await removeTaskInternal(transaction, action.id);

	noticeChange(ChangeEntityType.TASK, action.id, ChangeType.DELETE);
	for (const dayTaskId of deletedDayTaskIds) {
		noticeChange(ChangeEntityType.DAY_TASK, dayTaskId, ChangeType.DELETE);
	}
}

/**
 * Save a single day task.
 */
async function saveDayTask(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_TASK; }
	>,
	transaction: IDBTransaction,
): Promise<void> {
	// Protect against extraneous and undefined properties
	const dayTaskToSave: Parameters<typeof updateDayTaskInternal>[1] = {
		id: action.id,
	};
	if (typeof action.dayTask.note !== 'undefined') {
		dayTaskToSave.note = action.dayTask.note;
	}
	if (typeof action.dayTask.sortIndex !== 'undefined') {
		dayTaskToSave.sortIndex = action.dayTask.sortIndex;
	}
	if (typeof action.dayTask.status !== 'undefined') {
		dayTaskToSave.status = action.dayTask.status;
	}
	if (typeof action.dayTask.summary !== 'undefined') {
		dayTaskToSave.summary = action.dayTask.summary;
	}

	await updateDayTaskInternal(transaction, dayTaskToSave);
	noticeChange(ChangeEntityType.DAY_TASK, action.id);
}

/**
 * Save the note of a single day task, referenced by its day name and task ID instead of its ID.
 */
async function saveDayTaskLegacy(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_TASK_LEGACY; }
	>,
	transaction: IDBTransaction
): Promise<void> {
	const { dayName, taskId } = action;

	const [year, month, day] = getDayNameParts(dayName);

	const dayInfo = await getDayByDateInternal(transaction, { year, month, day });
	if (!dayInfo) {
		throw new Error(`Could not save day task - unable to find associated day ${JSON.stringify({ year, month, day })}`);
	}
	const dayTask = await getDayTaskForDayAndTaskInternal(transaction, {
		day: dayInfo.id,
		task: taskId,
	});
	if (!dayTask) {
		throw new Error(`Could not save day task - unable to find day task for day ${JSON.stringify({ year, month, day })} and task ${taskId}`);
	}

	saveDayTask({
		type: SaveType.DAY_TASK,
		id: dayTask.id,
		dayTask: action.dayTask,
	}, transaction);
}

/**
 * Adds a single day task.
 */
async function addDayTask(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_TASK_ADD; }
	>,
	transaction: IDBTransaction
): Promise<number> {
	const dayTaskId = await addDayTaskInternal(transaction, action.dayTask);

	noticeChange(ChangeEntityType.DAY_TASK, dayTaskId, ChangeType.ADD);

	return dayTaskId;
}


/**
 * Deletes a single day task.
 */
async function deleteDayTask(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_TASK_DELETE; }
	>,
	transaction: IDBTransaction
): Promise<void> {
	await removeDayTaskInternal(transaction, action.id);

	noticeChange(ChangeEntityType.DAY_TASK, action.id, ChangeType.DELETE);
}

/**
 * Save a single day.
 */
async function saveDay(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY; }
	>,
	transaction: IDBTransaction,
): Promise<void> {
	// Protect against extraneous and undefined properties
	const dayToSave: Parameters<typeof updateDayInternal>[1] = {
		id: action.id,
	};
	if (typeof action.day.note !== 'undefined') {
		dayToSave.note = action.day.note;
	}

	await updateDayInternal(transaction, dayToSave);
	noticeChange(ChangeEntityType.DAY, action.id);
}

/**
 * Add a new day.
 */
async function addDay(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_ADD; }
	>,
	transaction: IDBTransaction,
): Promise<number> {
	const dayId = await addDayInternal(transaction, action.day);

	noticeListChange(ChangeEntityType.DAY);
	noticeChange(ChangeEntityType.DAY, dayId);

	return dayId;
}

/**
 * Delete a single day, and any day tasks referencing it.
 */
async function deleteDay(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_DELETE; }
	>,
	transaction: IDBTransaction,
): Promise<void> {
	const deletedDayTaskIds = await removeDayInternal(transaction, action.id);

	noticeChange(ChangeEntityType.DAY, action.id, ChangeType.DELETE);
	for (const dayTaskId of deletedDayTaskIds) {
		noticeChange(ChangeEntityType.DAY_TASK, dayTaskId, ChangeType.DELETE);
	}
}

/**
 * For a given set of {@linkcode SaveAction}s, gather the required object stores needed to process them all.
 */
function gatherTransactionRequirements(
	actions: readonly SaveAction[]
): Iterable<ObjectStoreName> {
	// Gather requirements
	const objectStores = new Set<ObjectStoreName>();
	for (const action of actions) {
		if (
			action.type === SaveType.TASK ||
			action.type === SaveType.TASK_ADD
		) {
			objectStores.add(ObjectStoreName.TASK);
		} else if (action.type === SaveType.TASK_DELETE) {
			objectStores.add(ObjectStoreName.TASK);
			objectStores.add(ObjectStoreName.DAY_TASK);
		} else if (action.type === SaveType.DAY_TASK) {
			objectStores.add(ObjectStoreName.DAY_TASK);
			objectStores.add(ObjectStoreName.STATUS);
		} else if (action.type === SaveType.DAY_TASK_LEGACY) {
			objectStores.add(ObjectStoreName.DAY_TASK);
			objectStores.add(ObjectStoreName.STATUS);
			objectStores.add(ObjectStoreName.DAY);
		} else if (
			action.type === SaveType.DAY_TASK_ADD ||
			action.type === SaveType.TASK_ADD_WITH_DAY ||
			action.type === SaveType.TASK_STATUS ||
			action.type === SaveType.TASK_STATUS_FOR_DATE
		) {
			objectStores.add(ObjectStoreName.DAY_TASK);
			objectStores.add(ObjectStoreName.DAY);
			objectStores.add(ObjectStoreName.TASK);
			objectStores.add(ObjectStoreName.STATUS);
		} else if (action.type === SaveType.DAY_TASK_DELETE) {
			objectStores.add(ObjectStoreName.DAY_TASK);
		} else if (
			action.type === SaveType.DAY ||
			action.type === SaveType.DAY_ADD
		) {
			objectStores.add(ObjectStoreName.DAY);
		} else if (action.type === SaveType.DAY_DELETE) {
			objectStores.add(ObjectStoreName.DAY);
			objectStores.add(ObjectStoreName.DAY_TASK);
		} else {
			assertAllUnionMembersHandled(action);
		}
	}

	return Array.from(objectStores);
}
