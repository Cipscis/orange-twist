declare global {
	/** {@link https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition MDN Reference} */
	interface ViewTransition {
		finished: Promise<void>;
		ready: Promise<void>;
		updateCallbackDone: Promise<void>;

		skipTransition(): void;
	}

	interface Document {
		/** {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition MDN Reference} */
		startViewTransition?: (
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			callback: () => any
		) => ViewTransition;
	}
}

export {};
