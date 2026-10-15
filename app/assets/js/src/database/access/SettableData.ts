import {
	AsyncDataStateType,
	extractError,
	type SettableAsyncDataState,
} from 'utils';

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

		this.#state = {
			...this.#state,
			loading: true,
		};

		this.dispatchEvent(new ProgressEvent('loadstart'));
		try {
			await setDataPromise;

			this.#state = {
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			};
			this.dispatchEvent(new ProgressEvent('load'));
		} catch (e) {
			this.#state = {
				type: AsyncDataStateType.ERROR,
				error: extractError(e),
				loading: false,
			};
			this.dispatchEvent(new ProgressEvent('error'));
		}
		this.#abortController = null;
		this.dispatchEvent(new ProgressEvent('loadend'));
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
		this.dispatchEvent(new ProgressEvent('abort'));
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
