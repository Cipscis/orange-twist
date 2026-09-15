import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { IconName } from 'types/IconName';

import type { Status } from '../types';
import { ObjectStoreName } from '../metadata';
import { insertTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getStatusByAliasInternal } from './getStatusByAliasInternal';

describe('getStatusByAliasInternal', () => {
	beforeAll(() => insertTestData());

	test('returns a status with the specified name', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS);

		const status = await getStatusByAliasInternal(transaction, 'todo');

		expect(status).toEqual({
			id: 1,
			alias: 'todo',
			name: 'Todo',
			icon: IconName.TODO,
			colour: 'var(--blue)',
			completed: false,
		} satisfies Status);
	});

	test('returns null if no status exists with that name', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS);

		const status = await getStatusByAliasInternal(transaction, 'no status with this name');

		expect(status).toBeNull();
	});
});
