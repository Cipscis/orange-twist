import { channel } from './channel';
import type { Message } from './types';

export function postMessage(message: Message): void {
	channel.postMessage(message);
}
