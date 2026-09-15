import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { IconName } from 'types/IconName';

import type { Status } from '../types';
import { insertTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getStatusInternal } from './getStatusInternal';

import { addStatusInternal } from './addStatusInternal';

describe('addStatusInternal', () => {
	beforeEach(() => insertTestData());

	test('inserts a new status into the database, and returns its ID', async () => {
		const db = await getDatabase();
		const writeTransaction = db.transaction([
			ObjectStoreName.STATUS,
		], 'readwrite');

		const writeResult = await addStatusInternal(writeTransaction, {
			alias: 'will-not-do',
			name: 'Will not do',
			icon: IconName.WILL_NOT_DO,
			colour: 'var(--red)',
			completed: true,
		});

		expect(writeResult).toBe(10);

		const readTransaction = db.transaction([
			ObjectStoreName.STATUS,
		], 'readonly');

		const readResult = await getStatusInternal(readTransaction, 10);

		expect(readResult).toEqual({
			id: 10,
			alias: 'will-not-do',
			name: 'Will not do',
			icon: IconName.WILL_NOT_DO,
			colour: 'var(--red)',
			completed: true,
		} satisfies Status);
	});

	test('throws an error if a status already exists with that ID', async () => {
		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');

		// Add a task first
		await addStatusInternal(transaction, {
			id: 10,
			alias: 'will-not-do',
			name: 'Will not do',
			icon: IconName.WILL_NOT_DO,
			colour: 'var(--red)',
			completed: true,
		});

		// Then try adding it again
		await expect(
			() => addStatusInternal(transaction, {
				id: 10,
				alias: 'will-not-do',
				name: 'Will not do',
				icon: IconName.WILL_NOT_DO,
				colour: 'var(--red)',
				completed: true,
			})
		).rejects.toBeInstanceOf(Error);
	});
});
