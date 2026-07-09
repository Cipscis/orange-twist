import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getImagesInternal } from './getImagesInternal';

import { removeImageInternal } from './removeImageInternal';

describe('removeImageInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.IMAGE,
		], 'readwrite');
	});

	test('removes a specified image', async () => {
		await removeImageInternal(transaction, 'test-hash');

		const images = await getImagesInternal(transaction);

		expect(images).toEqual([]);
	});

	test('throws an error if the specified image does not exist', async () => {
		const promise = removeImageInternal(transaction, '');

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
