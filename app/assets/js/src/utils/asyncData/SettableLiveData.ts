import { AsyncDataStateType } from './AsyncDataStateType';
import type { AsyncDataState } from './AsyncDataState';

import {
	LiveData,
	type LiveDataOptions,
	type LiveDataObserveOptions,
} from './LiveData';

import {
	SettableData,
	type SettableDataOptions,
	type SettablePartial,
} from './SettableData';

export interface SettableLiveDataOptions<T> extends LiveDataOptions<T>, SettableDataOptions<T> {
	/**
	 * If set, provide an "optimistic" value after calling {@linkcode SettableAsyncDataResult.setData setData}. This allows the new value to be displayed immediately during the gap between setting it and retrieving it again.
	 *
	 * @default false
	 */
	optimistic?: boolean;
}

/**
 * A representation of data that can be get or set via asynchronous operations.
 */
export class SettableLiveData<T> {
	#optimistic: boolean;

	#liveData: LiveData<T>;
	#settableData: SettableData<T>;

	get #liveDataStateProxy(): AsyncDataState<T> {
		if (
			this.#optimistic &&
			typeof this.#optimisticDataOverride !== 'undefined' &&
			this.#liveData.state.type === AsyncDataStateType.SUCCESS
		) {
			if (Array.isArray(this.#optimisticDataOverride)) {
				return {
					...this.#liveData.state,
					// This type assertion is safe because array types can't be set partially
					data: this.#optimisticDataOverride as T,
				};
			} else if (typeof this.#optimisticDataOverride === 'object') {
				return {
					...this.#liveData.state,
					data: {
						...this.#liveData.state.data,
						...this.#optimisticDataOverride,
					},
				};
			} else {
				return {
					...this.#liveData.state,
					// This type assertion is safe because non-object types can't be set partially
					data: this.#optimisticDataOverride as T,
				};
			}
		}

		return this.#liveData.state;
	}
	#optimisticDataOverride: SettablePartial<T> | undefined;

	readonly getter: Readonly<
		Pick<LiveData<T>, 'addEventListener' | 'removeEventListener' | 'state'>
	>;
	readonly setter: Readonly<
		Pick<SettableData<T>, 'addEventListener' | 'removeEventListener' | 'state'>
	>;

	constructor(options: SettableLiveDataOptions<T>) {
		const self = this;

		this.#optimistic = options.optimistic ?? false;

		this.#liveData = new LiveData({
			...options,
			observeState(getData, state, signal) {
				if (self.#optimistic) {
					self.#optimisticDataOverride = undefined;
				}

				if (options.observeState) {
					options.observeState(getData, state, signal);
				}
			},
		});
		this.getter = {
			addEventListener: this.#liveData.addEventListener.bind(this.#liveData),
			removeEventListener: this.#liveData.removeEventListener.bind(this.#liveData),
			get state() {
				return self.#liveDataStateProxy;
			},
		};

		this.#settableData = new SettableData({
			...options,
			setData(data, signal) {
				self.#optimisticDataOverride = data;
				const setPromise = options.setData(data, signal);
				setPromise.catch(() => {
					// If something goes wrong when setting data, revert to last loaded data
					self.#optimisticDataOverride = undefined;
				});

				return setPromise;
			},
		});
		this.setter = {
			addEventListener: this.#settableData.addEventListener.bind(this.#settableData),
			removeEventListener: this.#settableData.removeEventListener.bind(this.#settableData),
			get state() {
				return self.#settableData.state;
			},
		};
	}

	/**
	 * Load the data, and begin watching for changes.
	 */
	observe(options?: LiveDataObserveOptions): void {
		this.#liveData.observe(options);
	}

	/**
	 * Stop watching for changes.
	 */
	unobserve(): void {
		this.#liveData.unobserve();
	}

	/** Set the data via partial update. */
	setData(data: SettablePartial<T>): Promise<void> {
		return this.#settableData.setData(data);
	}

	/** Abort any in-flight request to set data. */
	abort(): void {
		this.#settableData.abort();
	}

	[Symbol.dispose](): void {
		this.#liveData[Symbol.dispose]();
		this.#settableData[Symbol.dispose]();
	}
}
