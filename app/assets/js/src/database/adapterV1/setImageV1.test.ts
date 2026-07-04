import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getIdbRequestPromise } from 'utils';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { getImages } from '../getImages';

import { setImageV1 } from './setImageV1';

describe('setImageV1', () => {
	beforeEach(() => createTestData());

	test('adds new image', async () => {
		// Start from a blank slate - remove all images
		const db = await getDatabase();
		const writeTransaction = db.transaction(
			[ObjectStoreName.IMAGE],
			'readwrite'
		);
		const writeImageOS = writeTransaction.objectStore(ObjectStoreName.IMAGE);
		await getIdbRequestPromise(writeImageOS.clear());

		// Set image
		await setImageV1(
			new Blob(['test data'], { type: 'text/plain' }),
			'test-hash',
		);

		const images = await getImages();

		expect(images.length).toBe(1);
		expect(images[0].hash).toBe('test-hash');
	});

	test('updates existing image', async () => {
		await setImageV1(
			new Blob([JSON.stringify(null)], { type: 'application/json' }),
			'test-hash',
		);

		const images = await getImages();

		expect(images.length).toBe(1);
		expect(images[0].file.type).toBe('application/json');
	});
});
