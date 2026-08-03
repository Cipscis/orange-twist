import { SaveType, type SaveAction } from 'types/SaveAction';
import { assertAllUnionMembersHandled } from 'utils';

import { ObjectStoreName } from '../metadata';
import { getDatabase, getDayNameParts } from '../utils';
import {
	getDayByDateInternal,
	getDayTaskForDayAndTaskInternal,
	updateDayTaskInternal,
	updateTaskInternal,
} from '../internal';

/**
 * A helper class for managing database save actions.
 */
export class SaveHelper {
	constructor() {}

	/**
	 * Process any number of {@linkcode SaveAction}s.
	 */
	async save(actions: readonly SaveAction[]): Promise<void> {
		if (actions.length === 0) {
			return;
		}

		const objectStores = this.#gatherTransactionRequirements(actions);
		const db = await getDatabase();
		const transaction = db.transaction(objectStores, 'readwrite');

		for (const action of actions) {
			if (action.type === SaveType.TASK_NOTE) {
				this.#saveTaskNote(action, transaction);
			} else if (action.type === SaveType.DAY_TASK_NOTE_LEGACY) {
				this.#saveDayTaskNoteLegacy(action, transaction);
			} else if (action.type === SaveType.DAY_TASK_NOTE) {
				this.#saveDayTaskNote(action, transaction);
			} else {
				assertAllUnionMembersHandled(action);
			}
		}
	}

	/**
	 * Save the note of a single task.
	 */
	async #saveTaskNote(
		action: Extract<
			SaveAction, { type: typeof SaveType.TASK_NOTE; }
		>,
		transaction: IDBTransaction
	): Promise<void> {
		await updateTaskInternal(transaction, {
			id: action.task,
			note: action.note,
		});
	}

	/**
	 * Save the note of a single day task.
	 */
	async #saveDayTaskNote(
		action: Extract<
			SaveAction, { type: typeof SaveType.DAY_TASK_NOTE; }
		>,
		transaction: IDBTransaction,
	): Promise<void> {
		await updateDayTaskInternal(transaction, {
			id: action.dayTask,
			note: action.note,
		});
	}

	/**
	 * Save the note of a single day task, referenced by its day name and task ID instead of its ID.
	 */
	async #saveDayTaskNoteLegacy(
		action: Extract<
			SaveAction, { type: typeof SaveType.DAY_TASK_NOTE_LEGACY; }
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

		this.#saveDayTaskNote({
			type: SaveType.DAY_TASK_NOTE,
			dayTask: dayTask.id,
			note: action.note,
		}, transaction);
	}

	/**
	 * For a given set of {@linkcode SaveAction}s, gather the required object stores needed to process them all.
	 */
	#gatherTransactionRequirements(
		actions: readonly SaveAction[]
	): Iterable<ObjectStoreName> {
		// Gather requirements
		const objectStores = new Set<ObjectStoreName>();
		for (const action of actions) {
			if (action.type === SaveType.TASK_NOTE) {
				objectStores.add(ObjectStoreName.TASK);
				objectStores.add(ObjectStoreName.STATUS);
			} else if (action.type === SaveType.DAY_TASK_NOTE) {
				objectStores.add(ObjectStoreName.DAY_TASK);
				objectStores.add(ObjectStoreName.STATUS);
			} else if (action.type === SaveType.DAY_TASK_NOTE_LEGACY) {
				objectStores.add(ObjectStoreName.DAY_TASK);
				objectStores.add(ObjectStoreName.STATUS);
				objectStores.add(ObjectStoreName.DAY);
			} else {
				assertAllUnionMembersHandled(action);
			}
		}

		return Array.from(objectStores);
	}
}
