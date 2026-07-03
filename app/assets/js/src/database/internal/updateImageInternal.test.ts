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

import { updateImageInternal } from './updateImageInternal';

describe('updateImageInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction(ObjectStoreName.IMAGE, 'readwrite');
	});

	test('updates a specified image', async () => {
		const result = await updateImageInternal(transaction, {
			hash: 'test-hash',
			file: new Blob([JSON.stringify(null)], { type: 'application/json' }),
		});

		expect(result).toBeUndefined();

		const updatedImage = await getImageInternal(transaction, 'test-hash');

		expect(updatedImage?.file.type).toBe('application/json');
	});

	test('throws an error if the image doesn\'t exist', async () => {
		await expect(updateImageInternal(transaction, {
			hash: 'non-existent-hash',
			file: new Blob(['test data'], { type: 'text/plain' }),
		})).rejects.toBeInstanceOf(Error);
	});
});
