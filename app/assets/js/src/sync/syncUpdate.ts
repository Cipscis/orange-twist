// Type-only import to expose symbol to JSDoc
import type { onSyncUpdate } from './onSyncUpdate';

import { postMessage } from './postMessage';
import { MessageType } from './types';

/**
 * Fires all listeners bound with {@linkcode onSyncUpdate} in other
 * contexts, such as other browser tabs.
 */
export function syncUpdate(): void {
	postMessage({
		type: MessageType.SYNC_UPDATE,
	});
}
