import { useLayoutEffect, useState } from 'preact/hooks';

import { Task } from '../../../types/Task.js';

import { getUnfinishedTasksList } from '../tasksRegister.js';
import { onUnfinishedTasksListChange, offUnfinishedTasksListChange } from '../listeners/onUnfinishedTasksListChange.js';
/**
 * A custom hoook that provides the list of unfinished tasks.
 */
export function useUnfinishedTasksList(): ReadonlyArray<Readonly<Task>> {
	const [unfinishedTasksList, setUnfinishedTasksList] = useState<ReadonlyArray<Readonly<Task>>>(() => {
		return getUnfinishedTasksList();
	});

	// `useLayoutEffect` runs synchronously, so this approach works with
	// data being populated synchronously immediately after the initial render
	useLayoutEffect(() => {
		onUnfinishedTasksListChange(setUnfinishedTasksList);

		return (() => {
			offUnfinishedTasksListChange(setUnfinishedTasksList);
		});
	});

	return unfinishedTasksList;
}

// import { getDaysList } from '../daysRegister.js';
// import { offDaysListChange, onDaysListChange } from '../listeners/onDaysListChange.js';

// /**
//  * A custom hook that provides the list of days with associated data.
//  */
// export function useDaysList(): ReadonlyArray<string> {
// 	const [daysList, setDaysList] = useState<ReadonlyArray<string>>(() => {
// 		return getDaysList();
// 	});

// 	// `useLayoutEffect` runs synchronously, so this approach works with
// 	// data being populated synchronously immediately after the initial render
// 	useLayoutEffect(() => {
// 		onDaysListChange(setDaysList);

// 		return (() => {
// 			offDaysListChange(setDaysList);
// 		});
// 	});

// 	return daysList;
// }
