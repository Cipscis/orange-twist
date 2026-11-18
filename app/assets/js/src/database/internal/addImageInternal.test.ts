import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getImageInternal } from './getImageInternal';

import { addImageInternal } from './addImageInternal';

describe('addImageInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.IMAGE,
		], 'readwrite');
	});

	test('inserts a new image into the database, and returns its ID', async () => {
		const imageId = await addImageInternal(
			transaction,
			{
				file: new Blob(['Test data'], { type: 'text/plain' }),
				hash: '916f0027',
			}
		);

		expect(imageId).toBe(1);

		const image = await getImageInternal(transaction, 1);

		expect(image?.file.type).toBe('text/plain');
	});

	test('throws an error if an image already exists with the specified hash', async () => {
		const promise = addImageInternal(
			transaction,
			{
				file: new Blob(['Test data'], { type: 'text/plain' }),
				hash: '916f0027',
			}
		);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});
});
