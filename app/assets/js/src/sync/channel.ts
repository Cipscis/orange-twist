import { LocalStorageKey } from './localStorageKey';
import { MessageType, isMessage } from './types';

export const syncCallbacks = new Set<() => void>();

export const channel = new BroadcastChannel('orange-twist');

/**
 * Execute each sync callback in order.
 */
function callSyncCallbacks() {
	const callbacks = syncCallbacks.values();
	for (const callback of callbacks) {
		callback();
	}
}

// Add a listener for "sync update" events firing in other contexts.
channel.addEventListener(
	'message',
	({ data: message }) => {
		if (!isMessage(message)) {
			return;
		}

		if (message.type === MessageType.SYNC_UPDATE) {
			const updateNumber = localStorage.getItem(
				LocalStorageKey.UPDATE_NUMBER
			);
			if (updateNumber === message.data) {
				callSyncCallbacks();
			} else {
				window.addEventListener(
					'storage',
					callSyncCallbacks,
					{ once: true }
				);
			}
		}
	}
);
