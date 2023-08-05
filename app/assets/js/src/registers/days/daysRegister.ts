import { DeepPartial } from '@cipscis/ts-toolbox';

import { formatDate } from '../../formatters/date.js';

import { Day } from '../../types/Day.js';

import { isValidDateString } from '../../util/isValidDateString.js';

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
export async function loadDaysData(): Promise<ReadonlyArray<Readonly<Day>>> {
	if (!isInitialised) {
		if (loadDaysDataPromise) {
			// If a request is still in progress, piggyback on that request
			return loadDaysDataPromise;
		}

		loadDaysDataPromise = new Promise<ReadonlyArray<Readonly<Day>>>((resolve, reject) => {
			loadDays()
				.then((persistedDays) => {
					// Initialise register with an empty day for today
					setDayData(
						formatDate(new Date()),
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

interface SetDayDataOptions {
	/** @default true */
	shouldCallListeners: boolean;
}
/**
 * Set data for a given day. If no data exists
 * for this day yet, it will be added.
 */
export function setDayData(dayName: string, data: DeepPartial<Omit<Day, 'date'>>, options?: SetDayDataOptions): void {
	if (!isValidDateString(dayName)) {
		throw new RangeError(`Invalid day name ${dayName}`);
	}

	const day = daysRegister.get(dayName) ?? null;

	const updatedData = mergeDayData(dayName, day, data);
	daysRegister.set(dayName, updatedData);

	if (options?.shouldCallListeners ?? true) {
		callListeners();
	}
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
