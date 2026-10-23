import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { getDatabase } from '../utils';
import { requestTransaction } from './requestTransaction';

describe('requestTransaction', () => {
	// To standardise timing, make sure the database already exists so is being retrieved, not opened
	beforeAll(() => getDatabase());

	test('returns a Promise that resolves a transaction with the requested access', async () => {
		const transaction = await requestTransaction(
			[ObjectStoreName.DAY, ObjectStoreName.DAY_TASK],
			'readwrite'
		);

		expect(
			Array.from(transaction.objectStoreNames)
		).toEqual(
			[ObjectStoreName.DAY, ObjectStoreName.DAY_TASK]
		);
		expect(transaction.mode).toBe('readwrite');
	});

	test('combines concurrent requests and provides a single transaction with combined access levels', async () => {
		const transactionPromise1 = requestTransaction(
			[ObjectStoreName.DAY, ObjectStoreName.DAY_TASK],
			'readonly'
		);

		const transactionPromise2 = requestTransaction(
			[ObjectStoreName.TASK],
			'readwrite',
		);

		// Allow first two requests to accumulate
		await Promise.resolve();
		// Get internal database handle
		await Promise.resolve();
		// Follow up in the very next microtask queue
		await Promise.resolve();

		// Request a third transaction at the worst possible time, make sure it works correctly
		const transactionPromise3 = requestTransaction(
			[ObjectStoreName.STATUS],
			'readonly',
		);

		const [transaction1, transaction2, transaction3] = await Promise.all([transactionPromise1, transactionPromise2, transactionPromise3]);

		expect(transaction1).toBe(transaction2);

		expect(
			Array.from(transaction1.objectStoreNames)
		).toEqual(
			[ObjectStoreName.DAY, ObjectStoreName.DAY_TASK, ObjectStoreName.TASK]
		);
		expect(transaction1.mode).toBe('readwrite');

		expect(
			Array.from(transaction3.objectStoreNames)
		).toEqual([ObjectStoreName.STATUS]);
		expect(transaction3.mode).toBe('readonly');
	});
});
