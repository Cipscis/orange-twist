/* eslint-disable @typescript-eslint/no-explicit-any, no-var */

interface CloseWatcherOptions {
	signal?: AbortSignal;
}

interface CloseWatcher extends EventTarget {
	requestClose(): void;
	close(): void;
	destroy(): void;

	oncancel: ((this: GlobalEventHandlers, ev: Event) => any) | null;
	onclose: ((this: GlobalEventHandlers, ev: Event) => any) | null;
}

declare global {
	interface Window {
		/**
		 * [HTML Specification](https://html.spec.whatwg.org/multipage/interaction.html#the-closewatcher-interface)
		 */
		CloseWatcher?:  {
			prototype: CloseWatcher;
			new(options?: CloseWatcherOptions): CloseWatcher;
		};
	}
}

export {};
