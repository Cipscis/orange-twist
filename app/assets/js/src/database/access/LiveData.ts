import {
	AsyncDataStateType,
	extractError,
	type AsyncDataState,
	type GetAsyncDataOptions,
} from 'utils/asyncData';

export interface LiveDataOptions<T> {
	/**
	 * A method to asynchronously retrieve the data that should be represented by the {@linkcode LiveData} instance.
	 */
	getData: (options?: GetAsyncDataOptions) => Promise<T>;
	/**
	 * A function that sets up the necessary event listeners to re-fetch the data.
	 *
	 * An {@linkcode AbortSignal} is provided so that it can be used to define any necessary cleanup.
	 */
	observe?: (
		getData: (options?: GetAsyncDataOptions) => Promise<void>,
		signal: AbortSignal,
	) => void;
	/**
	 * A function that sets up any necessary event listeners that rely on the async data state and/or the value of the loaded data to re-fetch the data.
	 *
	 * An {@linkcode AbortSignal} is provided so that it can be used to define any necessary cleanup.
	 */
	observeState?: (
		getData: (options?: GetAsyncDataOptions) => Promise<void>,
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
	signal?: AbortSignal;
}

/**
 * A representation of asynchronously loaded data that can be updated live.
 *
 * To load data and begin live observation, call the {@linkcode LiveData.observe observe} method. To stop live observation, call the {@linkcode LiveData.unobserve unobserve} method.
 *
 * This class is primarily intended as a base class to be extended by other classes that load and observe particular types of data.
 */
// This class is intentionally modified with declaration merging to make event binding easier
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class LiveData<T> extends EventTarget {
	#state: AsyncDataState<T> = {
		type: AsyncDataStateType.INITIAL,
		loading: false,
	};
	/**
	 * A {@linkcode AsyncDataState} representing the current loading state of the represented data, which is updated automatically when in observing mode.
	 */
	get state(): AsyncDataState<T> {
		return this.#state;
	}
	#unobserveController: AbortController | null = null;
	#unobserveStateController: AbortController | null = null;

	#getData: LiveDataOptions<T>['getData'];
	#observe: LiveDataOptions<T>['observe'];
	#observeState: Required<LiveDataOptions<T>>['observeState'] | null = null;

	constructor(
		options: LiveDataOptions<T>,
	) {
		super();

		this.#getData = options.getData;
		this.#observe = options.observe;
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
		const signal = AbortSignal.any(signals);

		this.#loadDataAndUpdateState({ signal }).catch(() => {
			// Consider any errors thrown within this async function as handled
		});
		if (this.#observe) {
			this.#observe(this.#loadDataAndUpdateState, signal);
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
	#loadDataAndUpdateState = async function (this: LiveData<T>, getDataOptions?: GetAsyncDataOptions): Promise<void> {
		this.#state = {
			...this.state,
			loading: true,
		};

		// Get the data, enter success or error state correspondingly, and fire necessary events
		this.dispatchEvent(new ProgressEvent('loadstart'));
		try {
			const value = await this.#getData(getDataOptions);

			this.#state = {
				type: AsyncDataStateType.SUCCESS,
				data: value,
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
		this.dispatchEvent(new ProgressEvent('loadend'));

		// Clean up any previous `observeState` call
		if (this.#unobserveStateController) {
			this.#unobserveStateController.abort();
			this.#unobserveStateController = null;
		}
		// Call any `observeState` method with the updated state
		if (this.#observeState) {
			this.#unobserveStateController = new AbortController();
			const signals = [this.#unobserveStateController.signal];
			if (getDataOptions?.signal) {
				signals.push(getDataOptions.signal);
			}
			this.#observeState(
				this.#loadDataAndUpdateState,
				this.#state,
				AbortSignal.any(signals),
			);
		}
	}.bind(this);
}

interface LiveDataEventMap {
	loadstart: [ProgressEvent, AsyncDataStateType];
	loadend: [ProgressEvent, AsyncDataStateType];
	load: [ProgressEvent, typeof AsyncDataStateType.SUCCESS];
	error: [ProgressEvent, typeof AsyncDataStateType.ERROR];
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
}
