import { extractError } from '../extractError';

import { AsyncActionStateType } from './AsyncActionStateType';
import type { AsyncActionState } from './AsyncActionState';

export interface AsyncActionFnOptions {
	/**
	 * An `AbortSignal`. If it is aborted, the asynchronous operation should also be aborted.
	 */
	signal: AbortSignal;
}

export interface AsyncActionFn<T, A extends unknown[] = []> {
	(options: AsyncActionFnOptions, ...args: A): Promise<T>;
}

/**
 * A representation of an asynchronously operation.
 *
 * To load data, call the {@linkcode AsyncAction["start"] start} method. The internal state will be updated automatically, and can be watched via event listeners.
 */
// This class is intentionally modified with declaration merging to make event binding easier
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class AsyncAction<T, A extends unknown[] = []> extends EventTarget {
	#state: AsyncActionState<T>;
	/**
	 * An {@linkcode AsyncActionState} representing the current loading state of the represented data, which is updated automatically when in observing mode.
	 */
	get state(): AsyncActionState<T> {
		return this.#state;
	}

	#abortController: AbortController | null;

	#start: AsyncActionFn<T, A>;

	constructor(
		/**
		 * A method to perform the asynchronous operation that should be represented by the {@linkcode AsyncAction} instance.
		 */
		fn: AsyncActionFn<T, A>,
	) {
		super();

		this.#state = {
			type: AsyncActionStateType.INITIAL,
			loading: false,
			progress: null,
		};

		this.#abortController = null;

		this.#start = fn;
	}

	/**
	 * Handle loading the data, updating the internal {@linkcode AsyncActionState}, and firing the relevant `'loadstart'`, `'load'`, `'error'`, and `'loadend'` {@linkcode ProgressEvent}s.
	 */
	async start(options?: AsyncActionFnOptions, ...args: A): Promise<void> {
		this.abort();

		this.#abortController = new AbortController();

		const signals = [this.#abortController.signal];
		if (options?.signal) {
			signals.push(options.signal);
		}
		const signal = AbortSignal.any(signals);

		const startPromise = this.#start({ signal }, ...args);
		const {
			promise: abortPromise,
			resolve: abortResolve,
		} = Promise.withResolvers<void>();

		signal.addEventListener('abort', () => {
			if (!this.#state.loading) {
				// Aborting only makes sense during a loading operation
				return;
			}

			// Reset state and fire events synchronously
			this.#state = {
				...this.#state,
				loading: false,
			};
			this.dispatchEvent(new ProgressEvent('abort'));
			this.dispatchEvent(new ProgressEvent('loadend'));
			abortResolve();
		});

		this.#state = {
			...this.state,
			loading: true,
		};

		// Get the data, enter success or error state correspondingly, and fire necessary events
		this.dispatchEvent(new ProgressEvent('loadstart'));
		try {
			const data = await Promise.race([startPromise, abortPromise]);

			if (signal.aborted) {
				return;
			} else {
				this.#state = {
					type: AsyncActionStateType.SUCCESS,
					// This type assertion is safe because if `signal.aborted` is `false` that means `getDataPromise` resolved first
					data: data as T,
					loading: false,
					progress: null,
				};
				this.dispatchEvent(new ProgressEvent('load'));
			}
		} catch (e) {
			this.#state = {
				type: AsyncActionStateType.ERROR,
				error: extractError(e),
				loading: false,
				progress: null,
			};
			this.dispatchEvent(new ProgressEvent('error'));
		} finally {
			this.#abortController = null;
			this.dispatchEvent(new ProgressEvent('loadend'));
		}
	}

	abort(): void {
		if (!this.#abortController) {
			// No action is in progress, so there's nothing to abort
			return;
		}

		this.#abortController.abort();
		this.#abortController = null;
	}

	[Symbol.dispose](): void {
		this.abort();
	}
}

interface AsyncActionEventMap {
	loadstart: [ProgressEvent, AsyncActionStateType];
	loadend: [ProgressEvent, AsyncActionStateType];
	load: [ProgressEvent, typeof AsyncActionStateType.SUCCESS];
	error: [ProgressEvent, typeof AsyncActionStateType.ERROR];
	abort: [ProgressEvent, AsyncActionStateType];
}

// Use declaration merging to give hints about event listeners
export interface AsyncAction<T, A extends unknown[] = []> {
	addEventListener<
		K extends keyof AsyncActionEventMap
	>(
		type: K,
		listener: (
			this: AsyncAction<T, A> & {
				state: Extract<
					AsyncAction<T, A>['state'],
					{ type: AsyncActionEventMap[K][1]; }
				>;
			},
			ev: AsyncActionEventMap[K][0]
		) => void,
		options?: boolean | AddEventListenerOptions,
	): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

	removeEventListener<
		K extends keyof AsyncActionEventMap
	>(
		type: K,
		listener: (
			this: AsyncAction<T, A> & {
				state: Extract<
					AsyncAction<T, A>['state'],
					{ type: AsyncActionEventMap[K][1]; }
				>;
			},
			ev: AsyncActionEventMap[K][0]
		) => void,
		options?: boolean | EventListenerOptions,
	): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
