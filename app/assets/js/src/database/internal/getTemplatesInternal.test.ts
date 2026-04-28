import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';
import { ObjectStoreName } from 'database/metadata';

import { createTestData } from 'database/test-utils';
import { getDatabase } from 'utils/indexedDB';
import { getTemplatesInternal } from './getTemplatesInternal';

describe('getTemplatesInternal', () => {
	beforeAll(() => createTestData());

	test('returns all templates', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TEMPLATE, 'readonly');
		const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

		const templates = await getTemplatesInternal(templateOS);

		expect(templates).toEqual([
			{
				id: 1,
				name: 'Template 1 name',
				template: 'Template 1',
				sortIndex: 0,
			},
			{
				id: 0,
				name: 'Template 0 name',
				template: 'Template 0',
				sortIndex: 1,
			},
		]);
	});
});
