import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getTemplateInternal } from './getTemplateInternal';

describe('getTemplateInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();
		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.TEMPLATE,
		], 'readonly');
	});

	test('returns a template with the specified template ID', async () => {
		const template = await getTemplateInternal(transaction, 1);

		expect(template).toEqual({
			id: 1,
			name: 'Template 1 name',
			template: 'Template 1',
			sortIndex: 1,
		});
	});

	test('returns null if no template exists by that template ID', async () => {
		const template = await getTemplateInternal(transaction, -1);

		expect(template).toBeNull();
	});
});
