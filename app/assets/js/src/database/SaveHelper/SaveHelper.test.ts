import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { SaveType } from 'types/SaveAction';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { getTaskInternal } from '../internal';

import { SaveHelper } from './SaveHelper';

describe('SaveHelper', () => {
	let db: IDBDatabase;
	let saveHelper: SaveHelper;

	beforeEach(async () => {
		await createTestData();
		db = await getDatabase();
		saveHelper = new SaveHelper();
	});

	test('saves task notes', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const beforeTask1 = await getTaskInternal(readTransaction, 1);
		const beforeTask2 = await getTaskInternal(readTransaction, 2);

		expect(beforeTask1?.note).toBe('Test task 1 note');
		expect(beforeTask2?.note).toBe('Test task 2 note');

		await saveHelper.save([
			{
				type: SaveType.TASK_NOTE,
				task: 1,
				note: 'New note 1',
			},
			{
				type: SaveType.TASK_NOTE,
				task: 2,
				note: 'New note 2',
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const afterTask1 = await getTaskInternal(readTransaction, 1);
		const afterTask2 = await getTaskInternal(readTransaction, 2);

		expect(afterTask1?.note).toBe('New note 1');
		expect(afterTask2?.note).toBe('New note 2');
	});
});
