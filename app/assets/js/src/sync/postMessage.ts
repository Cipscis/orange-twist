import { channel } from './channel';
import { LocalStorageKey } from './localStorageKey';
import { MessageType, type Message } from './types';

export function postMessage(message: Message): void {
	if (message.type === MessageType.SYNC_UPDATE) {
		localStorage.setItem(
			LocalStorageKey.UPDATE_NUMBER,
			message.data,
		);
	}
	channel.postMessage(message);
}
