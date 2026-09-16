import type { PersistApi } from 'persist';
import { getCurrentDateDayName } from 'utils';

import {
	getDayInfo,
	loadDaysRegister,
	setDayInfo,
} from '../days';
import { loadDayTasksRegister } from '../dayTasks';
import { loadTasksRegister } from '../tasks';
import { loadTemplatesRegister } from '../templates';

/**
 * Load persisted data into each register.
 */
export async function loadAllRegisters(persist: PersistApi): Promise<void> {
	await Promise.all([
		loadDaysRegister(persist).then(() => {
			// If there's no info for the current day, set up a stub
			const currentDateDayName = getCurrentDateDayName();
			if (getDayInfo(currentDateDayName) === null) {
				setDayInfo(currentDateDayName, {});
			}
		}),
		loadTasksRegister(persist),
		loadDayTasksRegister(persist),
		loadTemplatesRegister(persist),
	]);
}
