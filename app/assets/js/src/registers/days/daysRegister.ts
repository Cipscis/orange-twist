import { DeepPartial } from '@cipscis/ts-toolbox';

import { formatDate } from '../../formatters/date.js';

import { Day } from '../../types/Day.js';

import { isValidDateString } from '../../util/isValidDateString.js';

import { daysChangeListeners } from './listeners/onDaysChange.js';

import { loadDays } from './persistence/loadDays.js';

const daysRegister: Map<string, Readonly<Day>> = new Map();
initialiseDaysRegister();

/**
 * Fill the days register with initial data, then restore persisted data asynchronously.
 */
async function initialiseDaysRegister(): Promise<void> {
	// Initialise register with an empty day for today
	setDayData(formatDate(new Date()), {});

	// Restore persisted data
	const persistedData = await loadDays();
	if (persistedData === null) {
		return;
	}

	// TODO: We need to handle some sort of loading state, to prevent interaction
	for (const [dayName, dayData] of persistedData) {
		daysRegister.set(dayName, dayData);
	}

	callListeners();
}

/**
 * Retrieve all days' data
 */
export function getDays(): ReadonlyArray<Readonly<Day>> {
	const days = Array.from(daysRegister.values());

	days.sort((a, b) => a.dayName.localeCompare(b.dayName));

	return days;
}

/**
 * Retrieve the list of all days with data
 */
export function getDaysList(): ReadonlyArray<string> {
	const days = Array.from(daysRegister.keys());

	days.sort((a, b) => a.localeCompare(b));

	return days;
}

/**
 * Retrieve data for a given day, if it exists.
 *
 * If the day doesn't have any data, returns `null`.
 */
export function getDayData(dayName: string): Readonly<Day> | null {
	const day = daysRegister.get(dayName);

	return day ?? null;
}

export function getAllDaysData(): ReadonlyArray<[dayName: string, dayData: Readonly<Day>]> {
	return Array.from(daysRegister.entries());
}

/**
 * Merge deeply partial day data with existing day data, if present, and fill in any
 * blanks using a set of hard-coded defaults.
 */
function mergeDayData(
	dayName: string,
	dayData: Day | null,
	newDayData: DeepPartial<Omit<Day, 'date'>>
): Day {
	const defaultDayData: Day = {
		dayName,
		note: '',
		sections: [],
	};

	const defaultSection: Day['sections'][number] = {
		name: 'New section',
	};

	const newDataClone = structuredClone(newDayData);

	/* TODO: We're going to need a better way to deal with sections.
	Perhaps more specific functions like `addSection`? It's going to
	get complicated once we try to add tasks, since they belong in
	sections, so how does the data need to get sent? Will be easier
	with an interface like `addTaskToSectionOnDay` */
	const newDataSections = (newDataClone.sections ?? defaultDayData.sections).map((partialSection) => {
		const section = {
			...defaultSection,
			...partialSection,
		};

		return section;
	});

	const newDataWithSections = {
		...newDataClone,
		sections: newDataSections,
	};

	const updatedData = {
		...defaultDayData,
		...dayData,
		...newDataWithSections,
	};

	return updatedData;
}

/**
 * Set data for a given day. If no data exists
 * for this day yet, it will be added.
 */
export function setDayData(dayName: string, data: DeepPartial<Omit<Day, 'date'>>): void {
	if (!isValidDateString(dayName)) {
		throw new RangeError(`Invalid day name ${dayName}`);
	}

	const day = getDayData(dayName);

	const updatedData = mergeDayData(dayName, day, data);
	daysRegister.set(dayName, updatedData);

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
