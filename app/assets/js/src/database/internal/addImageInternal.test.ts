import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getImageInternal } from './getImageInternal';

import { addImageInternal } from './addImageInternal';

describe('addImageInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.IMAGE,
		], 'readwrite');
	});

	test('inserts a new image into the database, and returns its ID', async () => {
		const imageHash = await addImageInternal(
			transaction,
			{
				hash: 'new-hash',
				file: new Blob(['Test data'], { type: 'text/plain' }),
			}
		);

		expect(imageHash).toBe('new-hash');

		const image = await getImageInternal(transaction, 'new-hash');

		expect(image?.file.type).toBe('text/plain');
	});

	test('throws an error if an image already exists with the specified hash', async () => {
		const promise = addImageInternal(
			transaction,
			{
				hash: 'test-hash',
				file: new Blob(['Test data'], { type: 'text/plain' }),
			}
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
