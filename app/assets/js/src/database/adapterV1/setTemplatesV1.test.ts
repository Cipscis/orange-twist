import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from 'database/utils';
import { ObjectStoreName } from 'database/metadata';
import { getIdbRequestPromise } from 'utils';
import { setTemplatesV1 } from './setTemplatesV1';
import { getTemplatesInternal } from 'database/internal';

describe('setTemplatesV1', () => {
	beforeEach(() => createTestData());

	test('adds new templates', async () => {
		// Start from a blank slate - remove all templates
		const db = await getDatabase();
		const writeTransaction = db.transaction(
			[ObjectStoreName.TEMPLATE],
			'readwrite'
		);
		const writeTemplateOS = writeTransaction.objectStore(ObjectStoreName.TEMPLATE);
		await getIdbRequestPromise(writeTemplateOS.clear());

		// Set templates
		await setTemplatesV1([
			[0, {
				id: 0,
				name: 'New template 0 name',
				template: 'New template 0',
				sortIndex: 1,
			}],
		]);

		const readTransaction = db.transaction([
			ObjectStoreName.TEMPLATE,
		], 'readonly');
		const templates = await getTemplatesInternal(readTransaction);
		// IDs don't start at 0 because the database had data entered before it was cleared
		expect(templates).toEqual([
			{
				id: 0,
				name: 'New template 0 name',
				template: 'New template 0',
				sortIndex: 1,
			},
		]);
	});

	test('updates existing templates', async () => {
		await setTemplatesV1([
			[0, {
				id: 0,
				name: 'Template 0 name updated',
				template: 'Template 0 updated',
				sortIndex: 0,
			}],
			[1, {
				id: 1,
				name: 'Template 1 name updated',
				template: 'Template 1 updated',
				sortIndex: 1,
			}],
		]);

		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TEMPLATE, 'readonly');

		const templates = await getTemplatesInternal(transaction);
		expect(templates).toEqual([
			{
				id: 0,
				name: 'Template 0 name updated',
				template: 'Template 0 updated',
				sortIndex: 0,
			},
			{
				id: 1,
				name: 'Template 1 name updated',
				template: 'Template 1 updated',
				sortIndex: 1,
			},
		]);
	});

	test('removes removed templates', async () => {
		await setTemplatesV1([]);

		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TEMPLATE, 'readonly');

		const templates = await getTemplatesInternal(transaction);
		expect(templates).toEqual([]);
	});
});
