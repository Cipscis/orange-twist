import { clear, loadAllRegisters } from 'data';
import { local } from 'persist';

import { clearDatabase } from './clearDatabase';

import type { DatabaseData } from '../types';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	addDayInternal,
	addDayTaskInternal,
	addImageInternal,
	addStatusInternal,
	addTaskInternal,
	addTemplateInternal,
} from '../internal';

import { createTestData } from './createTestData';

/**
 * **Important!** For use within tests only.
 *
 * Construct an Orange Twist database v2 containing test data.
 */
export async function insertTestData(
	testData?: Partial<DatabaseData>
): Promise<void> {
	const defaultTestData = createTestData();
	const fullTestData = {
		[ObjectStoreName.DAY]: {
			...defaultTestData[ObjectStoreName.DAY],
			...testData?.[ObjectStoreName.DAY],
		},
		[ObjectStoreName.TASK]: {
			...defaultTestData[ObjectStoreName.TASK],
			...testData?.[ObjectStoreName.TASK],
		},
		[ObjectStoreName.DAY_TASK]: {
			...defaultTestData[ObjectStoreName.DAY_TASK],
			...testData?.[ObjectStoreName.DAY_TASK],
		},
		[ObjectStoreName.STATUS]: {
			...defaultTestData[ObjectStoreName.STATUS],
			...testData?.[ObjectStoreName.STATUS],
		},
		[ObjectStoreName.TEMPLATE]: {
			...defaultTestData[ObjectStoreName.TEMPLATE],
			...testData?.[ObjectStoreName.TEMPLATE],
		},
		[ObjectStoreName.IMAGE]: {
			...defaultTestData[ObjectStoreName.IMAGE],
			...testData?.[ObjectStoreName.IMAGE],
		},
	};

	// Start with a fresh database
	await clearDatabase();
	const database = await getDatabase(true);

	const transaction = database.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.TASK,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.STATUS,
		ObjectStoreName.TEMPLATE,
		ObjectStoreName.IMAGE,
	], 'readwrite');

	// Insert test days
	for (const day of Object.values(
		fullTestData[ObjectStoreName.DAY]
	)) {
		addDayInternal(transaction, day);
	}

	// Insert test statuses
	for (const status of Object.values(
		fullTestData[ObjectStoreName.STATUS]
	)) {
		addStatusInternal(transaction, status);
	}

	// Insert test tasks
	for (const task of Object.values(
		fullTestData[ObjectStoreName.TASK]
	)) {
		addTaskInternal(transaction, task);
	}

	// Insert test day tasks
	for (const dayTask of Object.values(
		fullTestData[ObjectStoreName.DAY_TASK]
	)) {
		addDayTaskInternal(transaction, dayTask);
	}

	// Insert test templates
	for (const template of Object.values(
		fullTestData[ObjectStoreName.TEMPLATE]
	)) {
		addTemplateInternal(transaction, template);
	}

	// Insert test images
	for (const image of Object.values(
		fullTestData[ObjectStoreName.IMAGE]
	)) {
		addImageInternal(transaction, image);
	}

	// While the work to migrate the UI over to the database v2, some parts still expect to be able to read data from the in-memory `Register` cache. So load this test data into those registers
	clear();
	await loadAllRegisters(local);
}
