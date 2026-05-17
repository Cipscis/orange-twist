import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from './test-utils';

import { getImages } from './getImages';

describe('getImages', () => {
	beforeAll(() => createTestData());

	test('returns a Promise that resolves to an array of image entries', async () => {
		const result = await getImages();

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(1);

		const [{
			file,
			...rest
		}] = result;

		expect(rest).toEqual({
			hash: 'test-hash',
		});
		expect(file).toBeInstanceOf(Blob);
		expect(await file.text()).toBe('test data');
	});
});
