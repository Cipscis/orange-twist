// Type-only import to expose symbol to JSDoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { onSyncUpdate } from './onSyncUpdate';

import { LocalStorageKey } from './localStorageKey';

import { postMessage } from './postMessage';
import { MessageType } from './types';

let updateNumber = Number(
	localStorage.getItem(LocalStorageKey.UPDATE_NUMBER)
) || 0;

/**
 * Fires all listeners bound with {@linkcode onSyncUpdate} in other
 * contexts, such as other browser tabs.
 */
export function syncUpdate(): void {
	updateNumber += 1;
	postMessage({
		type: MessageType.SYNC_UPDATE,
		data: String(updateNumber),
	});
}
