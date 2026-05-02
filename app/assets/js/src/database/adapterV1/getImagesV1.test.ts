import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from 'database/test-utils';

import { getImagesV1 } from './getImagesV1';

describe('getImagesV1', () => {
	beforeAll(() => createTestData());

	test('returns a Promise that resolves to an array of image entries', async () => {
		const result = await getImagesV1();

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(1);

		const [[hash, blob]] = result;
		expect(hash).toBe('test-hash');
		expect(blob).toBeInstanceOf(Blob);
		expect(await blob.text()).toBe('test data');
	});
});
