import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';

import { getTemplatesV1 } from './getTemplatesV1';

describe('getTemplatesV1', () => {
	beforeAll(async () => {
		await createTestData();
	});

	test('returns a Promise that resolves to template entries v1', async () => {
		const templates = await getTemplatesV1();

		expect(templates).toEqual([
			[2, {
				id: 2,
				name: 'Template 2 name',
				template: 'Template 2',
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
