import {
	assertAllUnionMembersHandled,
	AsyncDataStateType,
	extractError,
	type AsyncDataState,
} from 'utils';

import type {
	Day,
	DayTask,
	Task,
} from '../types';

import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
	type QualifiedChangeEntity,
} from './liveAccessManager';

import { loadDay } from './loadDay';
import { loadTask } from './loadTask';
import { loadDayTask } from './loadDayTask';

interface ChangeEntityTypeMap {
	[ChangeEntityType.DAY]: Day;
	[ChangeEntityType.TASK]: Task;
	[ChangeEntityType.DAY_TASK]: DayTask;
}

interface ObservableEntityObserveOptions {
	/**
	 * An {@linkcode AbortSignal} that, when aborted, will unobserve the {@linkcode ObservableEntity}.
	 */
	signal?: AbortSignal;
}

/**
 * A class representing an observable database entity, which can be kept up to date with live data from the database via the {@linkcode AsyncDataState} interface.
 *
 * To fetch data from the database and begin getting live updates, call the `observe` method. To stop getting live updates, e.g. on cleanup, call the `unobserve` method.
 *
 * Updates are reported using `ProgressEvent`s with names `'loadstart'`, `'loadend'`, `'load'`, and `'error'`.
 *
 * @example
 * ```ts
 * const observableDay = new ObservableEntity({
 * 	type: ChangeEntityType.DAY,
 * 	id: 1,
 * });
 *
 * // Set up event listeners for live update events
 * observableDay.addEventListener('loadstart', function () {
 * 	// Do something with loading state
 * });
 * observableDay.addEventListener('loadend', function () {
 * 	// Do something with loading state
 * });
 * observableDay.addEventListener('load', function () {
 * 	const { data } = this.asyncDataState;
 * 	// Do something with data
 * });
 * observableDay.addEventListener('error', function () {
 * 	const { error } = this.asyncDataState;
 * 	// Do something with error
 * });
 *
 * // Load data and start watching for live changes
 * observableDay.observe();
 *
 * // ...
 *
 * // Stop observing when no longer needed
 * observableDay.unobserve();
 * ```
 */
// This class is intentionally modified with declaration merging to make event binding easier
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ObservableEntity<T extends ChangeEntityType> extends EventTarget {
	#entity: Required<QualifiedChangeEntity<T>>;
	#unobserveController: AbortController | null;

	asyncDataState: AsyncDataState<ChangeEntityTypeMap[T]>;

	constructor(changeEntity: QualifiedChangeEntity<T>) {
		super();

		this.#entity = changeEntity;
		this.asyncDataState = {
			type: AsyncDataStateType.INITIAL,
			loading: false,
		};

		this.#unobserveController = null;
	}

	/**
	 * Load data for the {@linkcode QualifiedChangeEntity}, and begin listening for database changes.
	 */
	observe(
		options?: ObservableEntityObserveOptions,
	): void {
		if (this.#unobserveController) {
			throw new Error(`ObservableEntity is already being observed`);
		}

		this.#unobserveController = new AbortController();

		// Combine internal and external AbortSignals
		const signals = [this.#unobserveController.signal];
		if (options?.signal) {
			signals.push(options.signal);
		}
		const signal = AbortSignal.any(signals);

		this.#load();

		addChangeListener(
			ChangeType.ADD,
			this.#entity,
			() => this.#load(),
			{ signal }
		);

		addChangeListener(
			ChangeType.CHANGE,
			this.#entity,
			() => this.#load(),
			{ signal }
		);

		addChangeListener(
			ChangeType.DELETE,
			this.#entity,
			() => this.#load(),
			{ signal }
		);
	}

	/**
	 * Stop listening for database changes.
	 */
	unobserve(): void {
		this.#unobserveController?.abort();
		this.#unobserveController = null;
	}

	[Symbol.dispose](): void {
		this.unobserve();
	}

	/**
	 * Load data from the database and update the {@linkcode AsyncDataState} accordingly.
	 */
	async #load(): Promise<void> {
		this.asyncDataState.loading = true;
		this.dispatchEvent(new ProgressEvent('loadstart'));
		try {
			const value = await getChangeEntityValue(this.#entity);

			if (value === null) {
				// TODO: Should type be transformed somehow to be more user-friendly?
				throw new Error(`Could not find ${this.#entity.type} with ID ${this.#entity.id}`);
			}

			this.asyncDataState = {
				type: AsyncDataStateType.SUCCESS,
				data: value,
				loading: false,
			};
			this.dispatchEvent(new ProgressEvent('load'));
		} catch (e) {
			this.asyncDataState = {
				type: AsyncDataStateType.ERROR,
				error: extractError(e),
				loading: false,
			};
			this.dispatchEvent(new ProgressEvent('error'));
		}
	}
}

interface ObservableEntityEventMap {
	loadstart: [ProgressEvent, AsyncDataStateType];
	loadend: [ProgressEvent, AsyncDataStateType];
	load: [ProgressEvent, typeof AsyncDataStateType.SUCCESS];
	error: [ProgressEvent, typeof AsyncDataStateType.ERROR];
}

export interface ObservableEntity<T extends ChangeEntityType> {
	addEventListener<
		K extends keyof ObservableEntityEventMap
	>(
		type: K,
		listener: (
			this: ObservableEntity<T> & {
				asyncDataState: Extract<
					ObservableEntity<T>['asyncDataState'],
					{ type: ObservableEntityEventMap[K][1]; }
				>;
			},
			ev: ObservableEntityEventMap[K][0]
		) => void,
		options?: boolean | AddEventListenerOptions,
	): void;

	removeEventListener<
		K extends keyof ObservableEntityEventMap
	>(
		type: K,
		listener: (
			this: ObservableEntity<T> & {
				asyncDataState: Extract<
					ObservableEntity<T>['asyncDataState'],
					{ type: ObservableEntityEventMap[K][1]; }
				>;
			},
			ev: ObservableEntityEventMap[K][0]
		) => void,
		options?: boolean | EventListenerOptions,
	): void;
}

/**
 * Retrieve the value of a {@linkcode QualifiedChangeEntity} from the database.
 */
async function getChangeEntityValue<T extends ChangeEntityType>(
	entity: QualifiedChangeEntity<T>
): Promise<ChangeEntityTypeMap[T] | null> {
	if (entity.type === ChangeEntityType.DAY) {
		// This type assertion is safe because we've effectively narrowed T to Day
		return await loadDay(entity.id) as ChangeEntityTypeMap[T] | null;
	} else if (entity.type === ChangeEntityType.TASK) {
		// This type assertion is safe because we've effectively narrowed T to Task
		return await loadTask(entity.id) as ChangeEntityTypeMap[T] | null;
	} else if (entity.type === ChangeEntityType.DAY_TASK) {
		// This type assertion is safe because we've effectively narrowed T to DayTask
		return await loadDayTask(entity.id) as ChangeEntityTypeMap[T] | null;
	} else {
		assertAllUnionMembersHandled(entity.type);
	}
}
