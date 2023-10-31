import { Day } from '../../types/Day.js';

import {
	isValidDateString,
	getCurrentDateDayName,
	DeepPartial,
} from '../../util/index.js';

import { daysChangeListeners } from './listeners/onDaysChange.js';

import { loadDays } from './persistence/loadDays.js';

const daysRegister: Map<string, Readonly<Day>> = new Map();
let isInitialised = false;
let loadDaysDataPromise: ReturnType<typeof loadDaysData> | null = null;

/**
 * Load day data once, on first call, and store it in the register.
 *
 * Otherwise, return already stored day data.
 */
export async function loadDaysData(
	options?: { signal: AbortSignal }
): Promise<ReadonlyArray<Readonly<Day>>> {
	if (!isInitialised) {
		if (loadDaysDataPromise) {
			// If a request is still in progress, piggyback on that request
			return loadDaysDataPromise;
		}

		loadDaysDataPromise = new Promise<ReadonlyArray<Readonly<Day>>>((resolve, reject) => {
			if (options?.signal.aborted) {
				reject(options.signal.reason);
			}
			options?.signal.addEventListener('abort', reject);

			loadDays()
				.then((persistedDays) => {
					setDayData(
						getCurrentDateDayName(),
						{},
						{ shouldCallListeners: false }
					);

					for (const [dayName, dayData] of persistedDays) {
						daysRegister.set(dayName, dayData);
					}
					isInitialised = true;

					const days = getDays();
					resolve(days);
				})
				.catch(reject);
		});

		return loadDaysDataPromise;
	}

	return getDays();
}

/**
 * Retrieve all days' data
 */
export function getDays(): ReadonlyArray<Readonly<Day>> {
	const days = Array.from(daysRegister.values());

	days.sort((a, b) => a.dayName.localeCompare(b.dayName));

	return days;
}

export function getDayData(dayName: string): Readonly<Day> | null {
	return daysRegister.get(dayName) ?? null;
}

export function getAllDaysData(): ReadonlyArray<[dayName: string, dayData: Readonly<Day>]> {
	return Array.from(daysRegister.entries());
}

interface MergeDayDataOptions {
	/** @default false */
	overwriteTasks?: boolean;
}

/**
 * Merge deeply partial day data with existing day data, if present, and fill in any
 * blanks using a set of hard-coded defaults.
 */
function mergeDayData(
	dayName: string,
	dayData: Day | null,
	newDayData: DeepPartial<Omit<Day, 'date'>> & Partial<Pick<Day, 'tasks'>>,
	options?: MergeDayDataOptions
): Day {
	const defaultDayData: Day = {
		dayName,
		note: '',
		tasks: [],
	};

	const newDataClone = structuredClone(newDayData);

	if (options?.overwriteTasks && newDayData.tasks) {
		newDataClone.tasks = newDayData.tasks;
	} else if (newDataClone.tasks && dayData) {
		// If we're combining new and old task data, just update tasks with existing data
		const newDayTasks = Array.from(dayData.tasks);
		for (const newTask of newDataClone.tasks) {
			const taskIndex = newDayTasks.findIndex(({ id }) => id === newTask.id);
			if (taskIndex === -1) {
				newDayTasks.push(newTask);
			} else {
				newDayTasks[taskIndex] = newTask;
			}
		}
		newDataClone.tasks = newDayTasks;
	}

	const updatedData = {
		...defaultDayData,
		...dayData,
		...newDataClone,
	};

	return updatedData;
}

interface SetDayDataOptions extends MergeDayDataOptions {
	/** @default true */
	shouldCallListeners?: boolean;
}

/**
 * Set data for a given day. If no data exists
 * for this day yet, it will be added.
 */
export function setDayData(
	dayName: string,
	data: DeepPartial<Omit<Day, 'date'>> & Partial<Pick<Day, 'tasks'>>,
	options?: SetDayDataOptions
): void {
	if (!isValidDateString(dayName)) {
		throw new RangeError(`Invalid day name ${dayName}`);
	}

	const day = daysRegister.get(dayName) ?? null;

	const updatedData = mergeDayData(dayName, day, data, options);
	daysRegister.set(dayName, updatedData);

	if (options?.shouldCallListeners ?? true) {
		callListeners();
	}
}

/**
 * Remove a task from a specified day.
 */
export function removeTaskFromDay(dayName: string, taskId: number): void {
	const day = daysRegister.get(dayName) ?? null;
	if (!day) {
		return;
	}

	const taskIndex = day.tasks.findIndex((task) => task.id === taskId);
	if (taskIndex !== -1) {
		day.tasks.splice(taskIndex, 1);
	}

	callListeners();
}

/**
 * Remove data for a given day.
 */
export function deleteDay(dayName: string): void {
	daysRegister.delete(dayName);

	callListeners();
}

function callListeners() {
	const days = getDays();
	for (const listener of daysChangeListeners) {
		listener(days);
	}
}
