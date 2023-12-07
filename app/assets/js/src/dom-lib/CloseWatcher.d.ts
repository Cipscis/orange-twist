interface CloseWatcherOptions {
	/**
	 * If the `signal` option is provided, then *watcher* can be destroyed (as if by `watcher.destroy()`) by aborting the given `AbortSignal`.
	 */
	signal?: AbortSignal;
}

declare global {
	interface CloseWatcher extends EventTarget {
		requestClose(): void;
		close(): void;
		destroy(): void;

		// Following the pattern from built-in TypeScript
		// DOM API types, which use explicit `any`
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		oncancel: ((this: GlobalEventHandlers, ev: Event) => any) | null;
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		onclose: ((this: GlobalEventHandlers, ev: Event) => any) | null;
	}

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
