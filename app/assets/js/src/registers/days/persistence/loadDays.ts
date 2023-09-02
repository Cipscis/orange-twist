import { z } from 'zod';

import { Day, daySchema } from '../../../types/Day.js';

import { isZodSchemaType } from '../../../util/index.js';

const validDaysDataSchema = z.array(
	z.tuple([
		z.string(),
		daySchema,
	])
);

export const isValidDaysData = isZodSchemaType(validDaysDataSchema);

/**
 * Load data for the days register from where it was persisted.
 */
export async function loadDays(): Promise<Array<[string, Day]>> {
	const serialisedDays = localStorage.getItem('days');
	if (serialisedDays === null) {
		return [];
	}

	const persistedDays = JSON.parse(serialisedDays) as unknown;

	if (!isValidDaysData(persistedDays)) {
		throw new TypeError('Invalid days data');
	}

	return persistedDays;
}
