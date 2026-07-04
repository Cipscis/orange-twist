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

import { setImagesV1 } from './setImagesV1';

describe('setImagesV1', () => {
	beforeEach(() => createTestData());

	test('adds new images', async () => {
		// Start from a blank slate - remove all images
		const db = await getDatabase();
		const writeTransaction = db.transaction(
			[ObjectStoreName.IMAGE],
			'readwrite'
		);
		const writeImageOS = writeTransaction.objectStore(ObjectStoreName.IMAGE);
		await getIdbRequestPromise(writeImageOS.clear());

		// Set images
		await setImagesV1([
			['new-hash-1', new Blob(['new-blob-1'], { type: 'text/plain' })],
			['new-hash-2', new Blob(['new-blob-2'], { type: 'text/plain' })],
		]);

		const images = await getImages();
		expect(images.length).toBe(2);
		expect(images[0].hash).toBe('new-hash-1');
		expect(images[1].hash).toBe('new-hash-2');
	});

	test('updates existing images', async () => {
		await setImagesV1([
			['test-hash', new Blob([JSON.stringify(null)], { type: 'application/json' })],
		]);

		const images = await getImages();
		expect(images.length).toBe(1);
		expect(images[0].file.type).toBe('application/json');
	});

	test('removes removed images', async () => {
		await setImagesV1([]);

		const images = await getImages();
		expect(images).toEqual([]);
	});
});
