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

import { getTemplateByAliasInternal } from './getTemplateByAliasInternal';

describe('getTemplateByAliasInternal', () => {
	let transaction: IDBTransaction;

	beforeAll(() => insertTestData());

	beforeEach(async () => {
		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.TEMPLATE,
		], 'readonly');
	});

	test('returns a template with the specified template alias', async () => {
		const template = await getTemplateByAliasInternal(transaction, 'template-1-name');

		expect(template).toEqual({
			id: 1,
			name: 'Template 1 name',
			alias: 'template-1-name',
			definition: 'Template 1',
			sortIndex: 1,
		} satisfies Template);
	});

	test('returns null if no template exists by that template alias', async () => {
		const template = await getTemplateByAliasInternal(transaction, 'no-template-exists');

		expect(template).toBeNull();
	});
});
