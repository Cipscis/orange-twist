import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { Template } from '../types';
import { ObjectStoreName } from '../metadata';
import { insertTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getTemplateByNameInternal } from './getTemplateByNameInternal';

describe('getTemplateByNameInternal', () => {
	let transaction: IDBTransaction;

	beforeAll(() => insertTestData());

	beforeEach(async () => {
		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.TEMPLATE,
		], 'readonly');
	});

	test('returns a template with the specified template name', async () => {
		const template = await getTemplateByNameInternal(transaction, 'Template 1 name');

		expect(template).toEqual({
			id: 1,
			name: 'Template 1 name',
			definition: 'Template 1',
			sortIndex: 1,
		} satisfies Template);
	});

	test('returns null if no template exists by that template name', async () => {
		const template = await getTemplateByNameInternal(transaction, 'No template exists');

		expect(template).toBeNull();
	});
});
