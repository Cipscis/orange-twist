import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';

import { getTemplatesInternal } from './getTemplatesInternal';

describe('getTemplatesInternal', () => {
	beforeAll(() => createTestData());

	test('returns all templates', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TEMPLATE, 'readonly');

		const templates = await getTemplatesInternal(transaction);

		expect(templates).toEqual([
			{
				id: 2,
				name: 'Template 2 name',
				template: 'Template 2',
				sortIndex: 0,
			},
			{
				id: 1,
				name: 'Template 1 name',
				template: 'Template 1',
				sortIndex: 1,
			},
		] satisfies Awaited<ReturnType<typeof getTemplatesInternal>>);
	});
});
