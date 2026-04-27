import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from 'database/test-utils';

import { getTemplatesV1 } from './getTemplatesV1';

describe('getTemplatesV1', () => {
	beforeAll(async () => {
		await createTestData();
	});

	test('returns a Promise that resolves to template entries v1', async () => {
		const templates = await getTemplatesV1();

		expect(templates).toEqual([
			[0, {
				id: 0,
				name: 'Template 0 name',
				template: 'Template 0',
				sortIndex: 0,
			}],
			[1, {
				id: 1,
				name: 'Template 1 name',
				template: 'Template 1',
				sortIndex: 1,
			}],
		]);
	});
});
