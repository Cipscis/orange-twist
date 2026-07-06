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

import { updateTemplateInternal } from './updateTemplateInternal';

describe('updateTemplateInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.TEMPLATE,
		], 'readwrite');
	});

	test('updates a specified template and returns its ID', async () => {
		const result = await updateTemplateInternal(transaction, {
			id: 1,
			name: 'Template 1 name updated',
		});

		expect(result).toBe(1);

		const template = await getTemplateInternal(transaction, 1);
		expect(template).toEqual({
			id: 1,
			name: 'Template 1 name updated',
			template: 'Template 1',
			sortIndex: 1,
		} satisfies Awaited<ReturnType<typeof getTemplateInternal>>);
	});

	test('throws an error if the template doesn\'t exist', async () => {
		const promise = updateTemplateInternal(transaction, {
			id: -1,
			template: 'Updated template',
		});

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
