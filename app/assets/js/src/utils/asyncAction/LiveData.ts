import { taskDebounce } from 'utils/taskDebounce';

import { AsyncActionStateType } from './AsyncActionStateType';
import type { AsyncActionState } from './AsyncActionState';
import {
	AsyncAction,
	type AsyncActionFn,
	type AsyncActionFnOptions,
	type AsyncActionStartOptions,
} from './AsyncAction';

export interface LiveDataOptions<T> {
	/**
	 * A function that sets up the necessary event listeners to re-fetch the data.
	 *
	 * An {@linkcode AbortSignal} is provided so that it can be used to define any necessary cleanup.
	 */
	observe?: (
		getData: (options?: AsyncActionFnOptions) => void,
		signal: AbortSignal,
	) => void;
	/**
	 * A function that sets up any necessary event listeners that rely on the async data state and/or the value of the loaded data to re-fetch the data.
	 *
	 * An {@linkcode AbortSignal} is provided so that it can be used to define any necessary cleanup.
	 */
	observeState?: (
		getData: (options?: AsyncActionFnOptions) => void,
		state: Extract<
			AsyncActionState<T>,
			{
				type:
					| typeof AsyncActionStateType.SUCCESS
					| typeof AsyncActionStateType.ERROR;
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
 * To load data and begin live observation, call the {@linkcode LiveData.["observe"] observe} method. To stop live observation, call the {@linkcode LiveData["unobserve"] unobserve} method.
 */
export class LiveData<T> extends AsyncAction<T, []> {
	#unobserveController: AbortController | null = null;
	#unobserveStateController: AbortController | null = null;

	#observe: Required<LiveDataOptions<T>>['observe'] | null = null;
	#observeState: Required<LiveDataOptions<T>>['observeState'] | null = null;

	constructor(
		/**
		 * A function that retrieves the data being watched.
		 */
		fn: AsyncActionFn<T, []>,
		options?: LiveDataOptions<T>,
	) {
		super(fn);

		if (options?.observe) {
			this.#observe = options.observe;
		}
		if (options?.observeState) {
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

		this.start({ signal: observeCleanupSignal });
		if (this.#observe) {
			const internalGetData = (options?: AsyncActionFnOptions) => {
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
				return this.start({ signal: abortGetDataSignal });
			};

			this.#observe(
				taskDebounce(internalGetData),
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
	 * Handle loading the data, updating the internal {@linkcode AsyncActionState}, and firing the relevant `'loadstart'`, `'load'`, `'error'`, and `'loadend'` {@linkcode ProgressEvent}s.
	 */
	async start(getDataOptions: AsyncActionStartOptions): Promise<void> {
		await super.start(getDataOptions);

		if (
			getDataOptions.signal.aborted ||
			this.state.type === AsyncActionStateType.INITIAL
		) {
			// No need to re-do `observeStatus`
			return;
		}

		this.#observeStateWrapper(getDataOptions.signal, this.state);
	}

	/**
	 * If necessary, clean up any previous `observeState` call then re-call `observeState` with the provided state.
	 */
	#observeStateWrapper = function (
		this: LiveData<T>,
		abortGetDataSignal: AbortSignal,
		state: Extract<AsyncActionState<T>, { type: typeof AsyncActionStateType.SUCCESS; } | { type: typeof AsyncActionStateType.ERROR; }>
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

		const internalGetData = (options?: AsyncActionFnOptions) => {
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
			return this.start({ signal: abortGetDataWithStateSignal });
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
			taskDebounce(internalGetData),
			state,
			observeStateCleanupSignal,
		);
	}.bind(this);
}
