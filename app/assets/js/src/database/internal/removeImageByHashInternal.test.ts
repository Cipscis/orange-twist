import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { insertTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getAllImagesInternal } from './getAllImagesInternal';

import { removeImageByHashInternal } from './removeImageByHashInternal';

describe('removeImageByHashInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await insertTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.IMAGE,
		], 'readwrite');
	});

	test('removes a specified image', async () => {
		await removeImageByHashInternal(transaction, '916f0027');

		const images = await getAllImagesInternal(transaction);

		expect(images).toEqual([]);
	});

	test('throws an error if the specified image does not exist', async () => {
		const promise = removeImageByHashInternal(transaction, 'invalid-hash');

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
