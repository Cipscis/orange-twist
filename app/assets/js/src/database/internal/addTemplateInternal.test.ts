import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getTemplateInternal } from './getTemplateInternal';

import { addTemplateInternal } from './addTemplateInternal';

describe('addTemplateInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();
		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.TEMPLATE,
		], 'readwrite');
	});

	test('inserts a new template into the database, and returns its ID', async () => {
		const addResult = await addTemplateInternal(transaction, {
			name: 'Test template name',
			template: 'Test template',
			sortIndex: 0,
		});

		expect(addResult).toBe(3);

		const readResult = await getTemplateInternal(transaction, 3);

		expect(readResult).toEqual({
			id: 3,
			name: 'Test template name',
			template: 'Test template',
			sortIndex: 0,
		});
	});

	test('throws an error if a template already exists with that ID', async () => {
		const promise = addTemplateInternal(transaction, {
			id: 1,
			name: 'Template 1 name',
			template: 'Template 1',
			sortIndex: 0,
		});

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
