import {
	assertAllUnionMembersHandled,
	type AsyncDataState,
} from 'utils';

import type {
	Day,
	DayTask,
	Task,
} from '../types';

import { LiveData } from './LiveData';

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
 * 	const { data } = this.state;
 * 	// Do something with data
 * });
 * observableDay.addEventListener('error', function () {
 * 	const { error } = this.state;
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
export class ObservableEntity<T extends ChangeEntityType> extends LiveData<ChangeEntityTypeMap[T]> {
	constructor(changeEntity: QualifiedChangeEntity<T>) {
		super({
			async getData(_options) {
				const value = await getChangeEntityValue(changeEntity);

				if (value === null) {
					// TODO: Should type be transformed somehow to be more user-friendly?
					throw new Error(`Could not find ${changeEntity.type} with ID ${changeEntity.id}`);
				}

				return value;
			},
			observe(getData, signal) {
				addChangeListener(
					ChangeType.ADD,
					changeEntity,
					() => getData(),
					{ signal }
				);

				addChangeListener(
					ChangeType.CHANGE,
					changeEntity,
					() => getData(),
					{ signal }
				);

				addChangeListener(
					ChangeType.DELETE,
					changeEntity,
					() => getData(),
					{ signal }
				);
			},
		});
	}
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
