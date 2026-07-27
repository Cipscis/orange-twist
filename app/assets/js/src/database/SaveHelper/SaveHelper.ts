import { SaveType, type SaveAction } from 'types/SaveAction';
import { assertAllUnionMembersHandled } from 'utils';

import { ObjectStoreName } from '../metadata';
import { getDatabase } from '../utils';
import { updateTaskInternal } from 'database/internal';

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
			} else {
				assertAllUnionMembersHandled(action.type);
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
			} else {
				assertAllUnionMembersHandled(action.type);
			}
		}

		return Array.from(objectStores);
	}
}
