let queueTaskChannel: MessageChannel | null = null;

/**
 * Synchronously queue a task in next iteration of the browser event loop.
 */
export function queueMacrotask(callback: () => void): void {
	if (!('MessageChannel' in window)) {
		// Stupid jsdom doesn't implement MessageChannel, so I need a fallback to not break my tests
		queueMicrotask(callback);
		return;
	}

	const channel = (() => {
		if (queueTaskChannel) {
			return queueTaskChannel;
		}

		queueTaskChannel = new MessageChannel();
		queueTaskChannel.port1.start();

		return queueTaskChannel;
	})();

	channel.port1.addEventListener('message', () => callback(), { once: true });
	channel.port2.postMessage('');
}
