import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getTemplatesInternal } from './getTemplatesInternal';

import { removeTemplateInternal } from './removeTemplateInternal';

describe('removeTemplateInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.TEMPLATE,
		], 'readwrite');
	});

	test('removes a specified template', async () => {
		await removeTemplateInternal(transaction, 0);

		const templates = await getTemplatesInternal(transaction);

		expect(templates).toEqual([
			{
				id: 1,
				name: 'Template 1 name',
				template: 'Template 1',
				sortIndex: 0,
			},
		]);
	});

	test('throws an error if the specified template does not exist', async () => {
		const promise = removeTemplateInternal(transaction, -1);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
