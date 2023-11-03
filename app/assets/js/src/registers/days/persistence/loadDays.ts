import { z } from 'zod';

import type { Day } from 'types/Day';
import { daySchema } from 'types/Day';

import { isZodSchemaType } from 'util/index';

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
