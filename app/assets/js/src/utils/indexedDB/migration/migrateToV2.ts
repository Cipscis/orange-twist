import { ObjectStoreName } from '../ObjectStoreName';

/**
 * Migrate the Orange Twist database from v1 to v2.
 */
export function migrateToV2(db: IDBDatabase): void {
	console.log('updating database to v2...');
	db.deleteObjectStore(ObjectStoreName.DATA);
	db.deleteObjectStore(ObjectStoreName.IMAGES);

	db.createObjectStore(ObjectStoreName.DAY);
	db.createObjectStore(ObjectStoreName.TASK);
	db.createObjectStore(ObjectStoreName.DAY_TASK);
	db.createObjectStore(ObjectStoreName.STATUS);
	db.createObjectStore(ObjectStoreName.TEMPLATE);
	db.createObjectStore(ObjectStoreName.IMAGE);
	console.log('updated database v2');
}
