import { assertAllUnionMembersHandled } from 'utils';

import { ObjectStoreName } from '../metadata';
import { getDayNameParts } from '../utils';
import {
	addDayInternal,
	getDayByDateInternal,
	getDayTaskForDayAndTaskInternal,
	removeDayInternal,
	removeTaskInternal,
	updateDayInternal,
	updateDayTaskInternal,
	updateTaskInternal,
} from '../internal';

import { SaveType, type SaveAction } from './SaveAction';
import { requestTransaction } from './requestTransaction';
import {
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
		} else if (action.type === SaveType.TASK_DELETE) {
			deleteTask(action, transaction);
		} else if (action.type === SaveType.DAY_TASK_LEGACY) {
			saveDayTaskLegacy(action, transaction);
		} else if (action.type === SaveType.DAY_TASK) {
			saveDayTask(action, transaction);
		} else if (action.type === SaveType.DAY) {
			saveDay(action, transaction);
		} else if (action.type === SaveType.DAY_ADD) {
			addDay(action, transaction);
		} else if (action.type === SaveType.DAY_DELETE) {
			deleteDay(action, transaction);
		} else if (action.type === SaveType.DAY_LEGACY) {
			saveDayLegacy(action, transaction);
		} else if (action.type === SaveType.DAY_DELETE_LEGACY) {
			deleteDayLegacy(action, transaction);
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
	noticeChange(ChangeType.TASK, action.id);
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
	// TODO: Notice changes in lists of all tasks
	// TODO: Notice changes in lists of days tasks for this task
	noticeChange(ChangeType.TASK, action.id);
	for (const dayTaskId of deletedDayTaskIds) {
		noticeChange(ChangeType.DAY_TASK, dayTaskId);
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
	noticeChange(ChangeType.DAY_TASK, action.id);
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
	noticeChange(ChangeType.DAY, action.id);
}

/**
 * Add a new day.
 */
async function addDay(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_ADD; }
	>,
	transaction: IDBTransaction,
): Promise<void> {
	const dayId = await addDayInternal(transaction, action.day);
	noticeListChange(ChangeType.DAY);
	noticeChange(ChangeType.DAY, dayId);
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
	noticeListChange(ChangeType.DAY);
	// TODO: Notice changes in lists of days tasks for this day
	noticeChange(ChangeType.DAY, action.id);
	for (const dayTaskId of deletedDayTaskIds) {
		noticeChange(ChangeType.DAY_TASK, dayTaskId);
	}
}

async function deleteDayLegacy(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_DELETE_LEGACY; }
	>,
	transaction: IDBTransaction,
): Promise<void> {
	const [year, month, day] = getDayNameParts(action.name);
	const dayInfo = await getDayByDateInternal(transaction, { year, month, day });
	if (!dayInfo) {
		throw new Error(`Could not delete day - unable to find associated day ${JSON.stringify({ year, month, day })}`);
	}

	await deleteDay(
		{
			type: SaveType.DAY_DELETE,
			id: dayInfo.id,
		},
		transaction
	);
}

/**
 * Save the note of a single day, referenced by its day name instead of its ID.
 */
async function saveDayLegacy(
	action: Extract<
		SaveAction, { type: typeof SaveType.DAY_LEGACY; }
	>,
	transaction: IDBTransaction
): Promise<void> {
	const { dayName } = action;

	const [year, month, day] = getDayNameParts(dayName);

	const dayInfo = await getDayByDateInternal(transaction, { year, month, day });
	if (!dayInfo) {
		throw new Error(`Could not save day - unable to find associated day ${JSON.stringify({ year, month, day })}`);
	}

	saveDay({
		type: SaveType.DAY,
		id: dayInfo.id,
		day: action.day,
	}, transaction);
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
		if (action.type === SaveType.TASK) {
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
			action.type === SaveType.DAY ||
			action.type === SaveType.DAY_ADD ||
			action.type === SaveType.DAY_LEGACY
		) {
			objectStores.add(ObjectStoreName.DAY);
		} else if (
			action.type === SaveType.DAY_DELETE ||
			action.type === SaveType.DAY_DELETE_LEGACY
		) {
			objectStores.add(ObjectStoreName.DAY);
			objectStores.add(ObjectStoreName.DAY_TASK);
		} else {
			assertAllUnionMembersHandled(action);
		}
	}

	return Array.from(objectStores);
}
