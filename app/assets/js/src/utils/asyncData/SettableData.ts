import { extractError } from './extractError';
import { AsyncDataStateType } from './AsyncDataStateType';
import type { SettableAsyncDataState } from './SettableAsyncDataState';

export interface SettableDataOptions<T> {
	/**
	 * A function that sets data via partial update.
	 *
	 * Takes an {@linkcode AbortSignal} to allow requests to be aborted.
	 */
	setData: (
		data: Partial<T>,
		signal: AbortSignal,
	) => Promise<void>;
}

/**
 * A representation of data that can be updated via an asynchronous operation.
 */
// This class is intentionally modified with declaration merging to make event binding easier
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class SettableData<T> extends EventTarget {
	#state: SettableAsyncDataState = {
		type: AsyncDataStateType.INITIAL,
		loading: false,
	};
	/**
	 * A {@linkcode SettableAsyncDataState} representing the current state of any operation setting data.
	 */
	get state(): SettableAsyncDataState {
		return this.#state;
	}
	#abortController: AbortController | null = null;

	#setData: SettableDataOptions<T>['setData'];

	constructor(
		options: SettableDataOptions<T>
	) {
		super();

		this.#setData = options.setData;
	}

	/**
	 * Set the data via partial update.
	 */
	async setData(data: Partial<T>): Promise<void> {
		this.abort();

		this.#abortController = new AbortController();
		const { signal } = this.#abortController;

		const setDataPromise = this.#setData(data, signal);
		const {
			promise: abortPromise,
			resolve: abortResolve,
		} = Promise.withResolvers<void>();
		signal.addEventListener('abort', () => abortResolve());

		this.#state = {
			...this.#state,
			loading: true,
		};

		this.dispatchEvent(new ProgressEvent('loadstart'));
		try {
			await Promise.race([setDataPromise, abortPromise]);

			if (signal.aborted) {
				// State and event code is handled synchronously in abort method
				return;
			}
			this.#state = {
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			};
			this.dispatchEvent(new ProgressEvent('load'));
			this.dispatchEvent(new ProgressEvent('loadend'));
		} catch (e) {
			this.#state = {
				type: AsyncDataStateType.ERROR,
				error: extractError(e),
				loading: false,
			};
			this.dispatchEvent(new ProgressEvent('error'));
			this.dispatchEvent(new ProgressEvent('loadend'));
		} finally {
			this.#abortController = null;
		}
	}

	/**
	 * Abort any in-flight request.
	 */
	abort(): void {
		if (!this.#abortController) {
			// There is nothing in-flight
			return;
		}

		this.#abortController.abort();
		this.#abortController = null;
		// Reset state and fire events synchronously
		this.#state = {
			...this.#state,
			loading: false,
		};
		this.dispatchEvent(new ProgressEvent('abort'));
		this.dispatchEvent(new ProgressEvent('loadend'));
	}

	[Symbol.dispose](): void {
		this.abort();
	}
}

interface SettableDataEventMap {
	loadstart: [ProgressEvent, AsyncDataStateType];
	loadend: [ProgressEvent, AsyncDataStateType];
	load: [ProgressEvent, typeof AsyncDataStateType.SUCCESS];
	error: [ProgressEvent, typeof AsyncDataStateType.ERROR];
	abort: [ProgressEvent, AsyncDataStateType];
}

// Use declaration merging to give hints about event listeners
export interface SettableData<T> {
	addEventListener<
		K extends keyof SettableDataEventMap
	>(
		type: K,
		listener: (
			this: SettableData<T> & {
				state: Extract<
					SettableData<T>['state'],
					{ type: SettableDataEventMap[K][1]; }
				>;
			},
			ev: SettableDataEventMap[K][0]
		) => void,
		options?: boolean | AddEventListenerOptions,
	): void;

	removeEventListener<
		K extends keyof SettableDataEventMap
	>(
		type: K,
		listener: (
			this: SettableData<T> & {
				state: Extract<
					SettableData<T>['state'],
					{ type: SettableDataEventMap[K][1]; }
				>;
			},
			ev: SettableDataEventMap[K][0]
		) => void,
		options?: boolean | EventListenerOptions,
	): void;
}
