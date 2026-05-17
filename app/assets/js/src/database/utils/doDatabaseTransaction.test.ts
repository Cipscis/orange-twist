import {
	describe,
	expect,
	test,
} from '@jest/globals';
import { doDatabaseTransaction } from './doDatabaseTransaction';
import { ObjectStoreName } from 'database/metadata';

describe('doDatabaseTransaction', () => {
	test('returns a promise that resolves when a database transaction is complete', async () => {
		const writePromise = doDatabaseTransaction(
			'readwrite',
			[ObjectStoreName.TASK],
			([taskOS]) => taskOS.add({ test: 'test' })
		);

		await expect(writePromise).resolves.toBe(1);

		const readPromise = doDatabaseTransaction(
			'readonly',
			[ObjectStoreName.TASK],
			([taskOS]) => taskOS.get(1)
		);

		await expect(readPromise).resolves.toEqual({
			id: 1,
			test: 'test',
		});
	});
});
