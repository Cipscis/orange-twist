import { extractError } from './extractError';

import { AsyncDataStateType } from './AsyncDataStateType';
import type { AsyncDataState } from './AsyncDataState';

export interface GetAsyncDataOptions {
	/**
	 * An `AbortSignal`. If it is aborted, the asynchronous request for data should also be aborted.
	 */
	signal: AbortSignal;
}

export interface AsyncDataOptions<T> {
	/**
	 * A method to asynchronously retrieve the data that should be represented by the {@linkcode AsyncData} instance.
	 */
	getData: (options: GetAsyncDataOptions) => Promise<T>;
}

/**
 * A representation of asynchronously loaded data.
 *
 * To load data, call the {@linkcode AsyncData.getData getData} method. The internal state will be updated automatically, and can be watched via event listeners.
 */
// This class is intentionally modified with declaration merging to make event binding easier
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class AsyncData<T> extends EventTarget {
	#state: AsyncDataState<T> = {
		type: AsyncDataStateType.INITIAL,
		loading: false,
	};
	/**
	 * An {@linkcode AsyncDataState} representing the current loading state of the represented data, which is updated automatically when in observing mode.
	 */
	get state(): AsyncDataState<T> {
		return this.#state;
	}

	#getData: AsyncDataOptions<T>['getData'];

	constructor(
		options: AsyncDataOptions<T>,
	) {
		super();

		this.#getData = options.getData;
	}

	/**
	 * Handle loading the data, updating the internal {@linkcode AsyncDataState}, and firing the relevant `'loadstart'`, `'load'`, `'error'`, and `'loadend'` {@linkcode ProgressEvent}s.
	 */
	async getData(getDataOptions?: GetAsyncDataOptions): Promise<void> {
		const signal = getDataOptions?.signal ?? AbortSignal.any([]);

		const getDataPromise = this.#getData({ signal });
		const {
			promise: abortPromise,
			resolve: abortResolve,
		} = Promise.withResolvers<void>();

		signal.addEventListener('abort', () => {
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
			const data = await Promise.race([getDataPromise, abortPromise]);

			if (signal.aborted) {
				return;
			} else {
				this.#state = {
					type: AsyncDataStateType.SUCCESS,
					// This type assertion is safe because if `signal.aborted` is `false` that means `getDataPromise` resolved first
					data: data as T,
					loading: false,
				};
				this.dispatchEvent(new ProgressEvent('load'));
			}
		} catch (e) {
			this.#state = {
				type: AsyncDataStateType.ERROR,
				error: extractError(e),
				loading: false,
			};
			this.dispatchEvent(new ProgressEvent('error'));
		} finally {
			this.dispatchEvent(new ProgressEvent('loadend'));
		}
	}
}

interface AsyncDataEventMap {
	loadstart: [ProgressEvent, AsyncDataStateType];
	loadend: [ProgressEvent, AsyncDataStateType];
	load: [ProgressEvent, typeof AsyncDataStateType.SUCCESS];
	error: [ProgressEvent, typeof AsyncDataStateType.ERROR];
	abort: [ProgressEvent, AsyncDataStateType];
}

// Use declaration merging to give hints about event listeners
export interface AsyncData<T> {
	addEventListener<
		K extends keyof AsyncDataEventMap
	>(
		type: K,
		listener: (
			this: AsyncData<T> & {
				state: Extract<
					AsyncData<T>['state'],
					{ type: AsyncDataEventMap[K][1]; }
				>;
			},
			ev: AsyncDataEventMap[K][0]
		) => void,
		options?: boolean | AddEventListenerOptions,
	): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

	removeEventListener<
		K extends keyof AsyncDataEventMap
	>(
		type: K,
		listener: (
			this: AsyncData<T> & {
				state: Extract<
					AsyncData<T>['state'],
					{ type: AsyncDataEventMap[K][1]; }
				>;
			},
			ev: AsyncDataEventMap[K][0]
		) => void,
		options?: boolean | EventListenerOptions,
	): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
