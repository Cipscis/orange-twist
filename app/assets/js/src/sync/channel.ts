import { MessageType, isMessage } from './types';

export const syncCallbacks = new Set<() => void>();

export const channel = new BroadcastChannel('orange-twist');

// Add a listener for "sync update" events firing in other contexts.
channel.addEventListener(
	'message',
	({ data }) => {
		if (!isMessage(data)) {
			return;
		}

		if (data.type === MessageType.SYNC_UPDATE) {
			const callbacks = syncCallbacks.values();
			for (const callback of callbacks) {
				callback();
			}
		}
	}
);
