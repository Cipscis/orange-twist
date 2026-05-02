import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';
import { ObjectStoreName } from 'database/metadata';

import { createTestData } from 'database/test-utils';
import { getDatabase } from 'utils/indexedDB';
import { getImagesInternal } from './getImagesInternal';

describe('getImagesInternal', () => {
	beforeAll(() => createTestData());

	test('returns a Promise which resolves to an array of all images', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');
		const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

		const result = await getImagesInternal(imageOS);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(1);

		const [{
			file,
			...rest
		}] = result;

		expect(rest).toEqual({
			id: 0,
			hash: 'test-hash',
		});

		expect(file).toBeInstanceOf(Blob);
		expect(await file.text()).toBe('test data');
	});
});
