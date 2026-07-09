import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getIdbRequestPromise } from 'utils';
import {
	dbName,
	dbVersion,
	ObjectStoreName,
} from '../metadata';

import { clearDatabase } from '../test-utils';

import { migrateToV1 } from './migrateToV1';

import { migrateToLatest } from './migrateToLatest';

describe('migrateToLatest', () => {
	beforeEach(() => clearDatabase());

	test('migrates a v2 database from scratch', async () => {
		// Open v2 database first
		const openRequest = indexedDB.open(dbName, dbVersion);

		openRequest.addEventListener('upgradeneeded', (e) => {
			const db = openRequest.result;
			migrateToLatest(e, db);
		});

		const db = await getIdbRequestPromise(openRequest);

		expect(Array.from(db.objectStoreNames)).toEqual([
			ObjectStoreName.DAY,
			ObjectStoreName.DAY_TASK,
			ObjectStoreName.IMAGE,
			ObjectStoreName.STATUS,
			ObjectStoreName.TASK,
			ObjectStoreName.TEMPLATE,
		]);

		db.close();
	});

	test('migrates a database from v1', async () => {
		// Open v1 database first
		const openV1Request = indexedDB.open(dbName, 1);
		openV1Request.addEventListener('error', () => console.error(openV1Request.error));
		openV1Request.addEventListener('blocked', () => console.error(openV1Request.error));

		openV1Request.addEventListener('upgradeneeded', () => {
			const db = openV1Request.result;
			migrateToV1(db);
		});

		const dbV1 = await getIdbRequestPromise(openV1Request);
		dbV1.close();

		// Open v2 database next
		const openV2Request = indexedDB.open(dbName, dbVersion);

		openV2Request.addEventListener('upgradeneeded', (e) => {
			const db = openV2Request.result;
			migrateToLatest(e, db);
		});

		const dbV2 = await getIdbRequestPromise(openV2Request);

		expect(Array.from(dbV2.objectStoreNames)).toEqual([
			ObjectStoreName.DAY,
			ObjectStoreName.DAY_TASK,
			ObjectStoreName.IMAGE,
			ObjectStoreName.STATUS,
			ObjectStoreName.TASK,
			ObjectStoreName.TEMPLATE,
		]);

		dbV2.close();
	});
});
