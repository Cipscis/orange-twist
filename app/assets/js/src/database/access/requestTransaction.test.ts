import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { requestTransaction } from './requestTransaction';
import { ObjectStoreName } from 'database/metadata';

describe('requestTransaction', () => {
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

		const [transaction1, transaction2] = await Promise.all([transactionPromise1, transactionPromise2]);

		expect(transaction1).toBe(transaction2);

		expect(
			Array.from(transaction1.objectStoreNames)
		).toEqual(
			[ObjectStoreName.DAY, ObjectStoreName.DAY_TASK, ObjectStoreName.TASK]
		);
		expect(transaction1.mode).toBe('readwrite');
	});
});
