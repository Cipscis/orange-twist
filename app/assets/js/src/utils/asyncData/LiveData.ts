import { extractError } from './extractError';
import { AsyncDataStateType } from './AsyncDataStateType';
import type { AsyncDataState } from './AsyncDataState';

export interface GetAsyncDataOptions {
	/**
	 * An `AbortSignal`. If it is aborted, the asynchronous request for data should also be aborted.
	 */
	signal: AbortSignal;
}

export interface LiveDataOptions<T> {
	/**
	 * A method to asynchronously retrieve the data that should be represented by the {@linkcode LiveData} instance.
	 */
	getData: (options: GetAsyncDataOptions) => Promise<T>;
	/**
	 * A function that sets up the necessary event listeners to re-fetch the data.
	 *
	 * An {@linkcode AbortSignal} is provided so that it can be used to define any necessary cleanup.
	 */
	observe?: (
		getData: (options?: GetAsyncDataOptions) => void,
		signal: AbortSignal,
	) => void;
	/**
	 * A function that sets up any necessary event listeners that rely on the async data state and/or the value of the loaded data to re-fetch the data.
	 *
	 * An {@linkcode AbortSignal} is provided so that it can be used to define any necessary cleanup.
	 */
	observeState?: (
		getData: (options?: GetAsyncDataOptions) => void,
		state: Extract<
			AsyncDataState<T>,
			{
				type:
					| typeof AsyncDataStateType.SUCCESS
					| typeof AsyncDataStateType.ERROR;
			}
		>,
		signal: AbortSignal,
	) => void;
}

export interface LiveDataObserveOptions {
	/**
	 * An `AbortSignal`. If it is aborted, it will trigger the cleanup of the {@linkcode LiveDataOptions.observe observe} and {@linkcode LiveDataOptions.observeState observeState} options.
	 */
	signal?: AbortSignal;
}

/**
 * A representation of asynchronously loaded data that can be updated live.
 *
 * To load data and begin live observation, call the {@linkcode LiveData.observe observe} method. To stop live observation, call the {@linkcode LiveData.unobserve unobserve} method.
 */
// This class is intentionally modified with declaration merging to make event binding easier
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class LiveData<T> extends EventTarget {
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
	#unobserveController: AbortController | null = null;
	#unobserveStateController: AbortController | null = null;

	#getData: LiveDataOptions<T>['getData'];
	#observe: Required<LiveDataOptions<T>>['observe'] | null = null;
	#observeState: Required<LiveDataOptions<T>>['observeState'] | null = null;

	constructor(
		options: LiveDataOptions<T>,
	) {
		super();

		this.#getData = options.getData;
		if (options.observe) {
			this.#observe = options.observe;
		}
		if (options.observeState) {
			this.#observeState = options.observeState;
		}
	}

	/**
	 * Load the data, and begin watching for changes.
	 */
	observe(options?: LiveDataObserveOptions): void {
		if (this.#unobserveController) {
			// Already observing
			return;
		}
		this.#unobserveController = new AbortController();
		const signals = [this.#unobserveController.signal];
		if (options?.signal) {
			signals.push(options.signal);
		}
		/**
		 * This {@linkcode AbortSignal} will be aborted if:
		 *
		 * - `unobserve()` is called
		 * - The {@linkcode AbortSignal} passed to `observe()` is aborted
		 */
		const observeCleanupSignal = AbortSignal.any(signals);

		this.#loadDataAndUpdateState({ signal: observeCleanupSignal }).catch(() => {
			// Consider any errors thrown within this async function as handled
		});
		if (this.#observe) {
			const internalGetData = (options?: GetAsyncDataOptions) => {
				const signals = [observeCleanupSignal];
				if (options) {
					signals.push(options.signal);
				}
				/**
				 * This {@linkcode AbortSignal} will be aborted if:
				 *
				 * - `unobserve()` is called
				 * - The {@linkcode AbortSignal} passed to `observe()` is aborted
				 * - An {@linkcode AbortSignal} passed to a `getData()` call within `observe()` is aborted
				 */
				const abortGetDataSignal = AbortSignal.any(signals);
				return this.#loadDataAndUpdateState({ signal: abortGetDataSignal });
			};

			this.#observe(
				microDebounce(internalGetData),
				observeCleanupSignal,
			);
		}
	}

	/**
	 * Stop watching for changes.
	 */
	unobserve(): void {
		if (!this.#unobserveController) {
			// Not observing
			return;
		}

		this.#unobserveController.abort();
		this.#unobserveController = null;
	}

	[Symbol.dispose](): void {
		this.unobserve();
	}

	/**
	 * Handle loading the data, updating the internal {@linkcode AsyncDataState}, and firing the relevant `'loadstart'`, `'load'`, `'error'`, and `'loadend'` {@linkcode ProgressEvent}s.
	 */
	#loadDataAndUpdateState = async function (this: LiveData<T>, getDataOptions: GetAsyncDataOptions): Promise<void> {
		const getDataPromise = this.#getData(getDataOptions);
		const {
			promise: abortPromise,
			resolve: abortResolve,
		} = Promise.withResolvers<void>();

		/**
		 * This {@linkcode AbortSignal} will be aborted if:
		 *
		 * - `unobserve()` is called
		 * - The {@linkcode AbortSignal} passed to `observe()` is aborted
		 * - An {@linkcode AbortSignal} passed to a `getData()` call within `observe()` is aborted
		 * - An {@linkcode AbortSignal} passed to a `getData()` call within `observeState()` is aborted
		 */
		const abortGetDataSignal = getDataOptions.signal;
		abortGetDataSignal.addEventListener('abort', () => {
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

			if (getDataOptions.signal.aborted) {
				// No need to re-do `observeStatus`
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

		this.#observeStateWrapper(abortGetDataSignal, this.#state);
	}.bind(this);

	/**
	 * If necessary, clean up any previous `observeState` call then re-call `observeState` with the provided state.
	 */
	#observeStateWrapper = function (
		this: LiveData<T>,
		abortGetDataSignal: AbortSignal,
		state: Extract<AsyncDataState<T>, { type: typeof AsyncDataStateType.SUCCESS; } | { type: typeof AsyncDataStateType.ERROR; }>
	): void {
		// Clean up any previous `observeState` call
		if (this.#unobserveStateController) {
			this.#unobserveStateController.abort();
			this.#unobserveStateController = null;
		}
		if (!this.#observeState) {
			return;
		}

		// Call any `observeState` method with the updated state
		this.#unobserveStateController = new AbortController();

		const internalGetData = (options?: GetAsyncDataOptions) => {
			const signals = [abortGetDataSignal];
			if (options?.signal) {
				signals.push(options.signal);
			}
			/**
			 * This {@linkcode AbortSignal} will be aborted if:
			 *
			 * - `unobserve()` is called
			 * - The {@linkcode AbortSignal} passed to `observe()` is aborted
			 * - An {@linkcode AbortSignal} passed to a `getData()` call within `observe()` is aborted
			 * - An {@linkcode AbortSignal} passed to a `getData()` call within `observeState()` is aborted
			 */
			const abortGetDataWithStateSignal = AbortSignal.any(signals);
			return this.#loadDataAndUpdateState({ signal: abortGetDataWithStateSignal });
		};

		/**
		 * This {@linkcode AbortSignal} will be aborted if:
		 *
		 * - `unobserve()` is called
		 * - The {@linkcode AbortSignal} passed to `observe()` is aborted
		 * - An {@linkcode AbortSignal} passed to a `getData()` call within `observe()` is aborted
		 * - A state change completes
		 */
		const observeStateCleanupSignal = AbortSignal.any([
			abortGetDataSignal,
			this.#unobserveStateController.signal,
		]);
		this.#observeState(
			microDebounce(internalGetData),
			state,
			observeStateCleanupSignal,
		);
	}.bind(this);
}

interface LiveDataEventMap {
	loadstart: [ProgressEvent, AsyncDataStateType];
	loadend: [ProgressEvent, AsyncDataStateType];
	load: [ProgressEvent, typeof AsyncDataStateType.SUCCESS];
	error: [ProgressEvent, typeof AsyncDataStateType.ERROR];
	abort: [ProgressEvent, AsyncDataStateType];
}

// Use declaration merging to give hints about event listeners
export interface LiveData<T> {
	addEventListener<
		K extends keyof LiveDataEventMap
	>(
		type: K,
		listener: (
			this: LiveData<T> & {
				state: Extract<
					LiveData<T>['state'],
					{ type: LiveDataEventMap[K][1]; }
				>;
			},
			ev: LiveDataEventMap[K][0]
		) => void,
		options?: boolean | AddEventListenerOptions,
	): void;
	addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

	removeEventListener<
		K extends keyof LiveDataEventMap
	>(
		type: K,
		listener: (
			this: LiveData<T> & {
				state: Extract<
					LiveData<T>['state'],
					{ type: LiveDataEventMap[K][1]; }
				>;
			},
			ev: LiveDataEventMap[K][0]
		) => void,
		options?: boolean | EventListenerOptions,
	): void;
	removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

/**
 * Debounce a function so it will actually be called once after next processing the microtask queue, if called multiple times synchronously.
 */
function microDebounce<
	T extends (...args: any[]) => unknown
>(fn: T): (
	this: ThisParameterType<T>,
	...args: Parameters<T>
) => void {
	let callingBlocked = false;

	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		if (callingBlocked) {
			return;
		}
		callingBlocked = true;

		queueMicrotask(() => {
			fn.apply(this, args);
			callingBlocked = false;
		});
	};
}
