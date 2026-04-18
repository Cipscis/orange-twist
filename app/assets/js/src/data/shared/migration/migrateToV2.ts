import { IndexName } from '../IndexName';
import { ObjectStoreName } from '../ObjectStoreName';

/**
 * Migrate the Orange Twist database from v1 to v2.
 */
export function migrateToV2(db: IDBDatabase): void {
	db.deleteObjectStore(ObjectStoreName.DATA);
	db.deleteObjectStore(ObjectStoreName.IMAGES);

	db.createObjectStore(ObjectStoreName.DAY, { keyPath: 'id' });
	db.createObjectStore(ObjectStoreName.TASK, { keyPath: 'id' });
	const dayTaskOS = db.createObjectStore(ObjectStoreName.DAY_TASK, { keyPath: 'id' });
	dayTaskOS.createIndex(IndexName.DAY_TASK_DAY, 'day');
	db.createObjectStore(ObjectStoreName.STATUS, { keyPath: 'id' });
	db.createObjectStore(ObjectStoreName.TEMPLATE, { keyPath: 'id' });
	db.createObjectStore(ObjectStoreName.IMAGE, { keyPath: 'id' });
}
