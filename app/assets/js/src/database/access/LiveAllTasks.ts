import { LiveData } from 'utils/asyncData';

import type { Task } from '../types';
import { loadAllTasks } from './loadAllTasks';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';

/**
 * Provides live access to a list of all tasks, sorted according to their `sortIndex` property.
 */
export class LiveAllTasks extends LiveData<readonly Task[]> {
	constructor() {
		super({
			async getData(_options) {
				const tasks = await loadAllTasks();

				return tasks;
			},
			observe(getDataArg, signal) {
				const getData = () => getDataArg();

				const changeEntity = { type: ChangeEntityType.TASK };

				addChangeListener(ChangeType.ADD, changeEntity, getData, { signal });
				addChangeListener(ChangeType.CHANGE, changeEntity, getData, { signal });
				addChangeListener(ChangeType.DELETE, changeEntity, getData, { signal });
			},
		});
	}
}
