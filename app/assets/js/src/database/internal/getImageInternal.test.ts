import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { insertTestData } from '../test-utils';
import type { Image } from '../types';

import { getImageInternal } from './getImageInternal';

describe('getImageInternal', () => {
	let transaction: IDBTransaction;

	beforeAll(() => insertTestData());

	beforeEach(async () => {
		const db = await getDatabase();
		transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');
	});

	test('gets an image by its ID', async () => {
		const image = await getImageInternal(transaction, 1);

		const {
			file,
			...rest
		} = image!;

		expect(rest).toEqual({
			id: 1,
			hash: '916f0027',
		} satisfies Omit<Image, 'file'>);

		expect(file).toBeInstanceOf(Blob);
		expect(await file.text()).toBe('test data');
	});

	test('returns null if no image exists for that ID', async () => {
		const image = await getImageInternal(transaction, -1);

		expect(image).toBeNull();
	});
});
