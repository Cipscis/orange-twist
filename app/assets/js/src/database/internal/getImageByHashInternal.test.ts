import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';

import { getImageByHashInternal } from './getImageByHashInternal';

describe('getImageByHashInternal', () => {
	let transaction: IDBTransaction;

	beforeAll(() => createTestData());

	beforeEach(async () => {
		const db = await getDatabase();
		transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');
	});

	test('gets an image by its hash', async () => {
		const image = await getImageByHashInternal(transaction, 'test-hash');

		const {
			file,
			...rest
		} = image!;

		expect(rest).toEqual({
			id: 0,
			hash: 'test-hash',
		});

		expect(file).toBeInstanceOf(Blob);
		expect(await file.text()).toBe('test data');
	});

	test('returns null if no image exists for that hash', async () => {
		const image = await getImageByHashInternal(transaction, 'fake-hash');

		expect(image).toBeNull();
	});
});
