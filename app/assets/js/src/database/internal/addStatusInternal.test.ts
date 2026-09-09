import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getStatusInternal } from './getStatusInternal';

import { addStatusInternal } from './addStatusInternal';

describe('addStatusInternal', () => {
	beforeEach(() => createTestData());

	test('inserts a new status into the database, and returns its ID', async () => {
		const db = await getDatabase();
		const writeTransaction = db.transaction([
			ObjectStoreName.STATUS,
		], 'readwrite');

		const writeResult = await addStatusInternal(writeTransaction, {
			alias: 'will-not-do',
			name: 'Will not do',
			icon: 'will-not-do.svg',
			colour: 'var(--red)',
			completed: true,
		});

		expect(writeResult).toBe(4);

		const readTransaction = db.transaction([
			ObjectStoreName.STATUS,
		], 'readonly');

		const readResult = await getStatusInternal(readTransaction, 4);

		expect(readResult).toEqual({
			id: 4,
			alias: 'will-not-do',
			name: 'Will not do',
			icon: 'will-not-do.svg',
			colour: 'var(--red)',
			completed: true,
		} satisfies Awaited<ReturnType<typeof getStatusInternal>>);
	});

	test('throws an error if a status already exists with that ID', async () => {
		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');

		// Add a task first
		await addStatusInternal(transaction, {
			id: 4,
			alias: 'will-not-do',
			name: 'Will not do',
			icon: 'will-not-do.svg',
			colour: 'var(--red)',
			completed: true,
		});

		// Then try adding it again
		await expect(
			() => addStatusInternal(transaction, {
				id: 4,
				alias: 'will-not-do',
				name: 'Will not do',
				icon: 'will-not-do.svg',
				colour: 'var(--red)',
				completed: true,
			})
		).rejects.toBeInstanceOf(Error);
	});
});
