import { IndexName, ObjectStoreName } from '../metadata';

/**
 * Migrate the Orange Twist database from v1 to v2.
 */
export function migrateToV2(db: IDBDatabase): void {
	db.deleteObjectStore(ObjectStoreName.DATA);
	db.deleteObjectStore(ObjectStoreName.IMAGES);

	const dayOS = db.createObjectStore(ObjectStoreName.DAY, {
		keyPath: 'id',
		autoIncrement: true,
	});
	dayOS.createIndex(IndexName.DAY_DATE, ['year', 'month', 'day']);
	db.createObjectStore(ObjectStoreName.TASK, {
		keyPath: 'id',
		autoIncrement: true,
	});
	const dayTaskOS = db.createObjectStore(ObjectStoreName.DAY_TASK, {
		keyPath: 'id',
		autoIncrement: true,
	});
	dayTaskOS.createIndex(IndexName.DAY_TASK_DAY, 'day');
	dayTaskOS.createIndex(IndexName.DAY_TASK_TASK, 'task');
	dayTaskOS.createIndex(IndexName.DAY_TASK_DAY_TASK, ['day', 'task']);
	const statusOS = db.createObjectStore(ObjectStoreName.STATUS, {
		keyPath: 'id',
		autoIncrement: true,
	});
	statusOS.createIndex(IndexName.STATUS_ALIAS, 'alias');
	db.createObjectStore(ObjectStoreName.TEMPLATE, {
		keyPath: 'id',
		autoIncrement: true,
	});
	db.createObjectStore(ObjectStoreName.IMAGE, {
		keyPath: 'hash',
	});
}
