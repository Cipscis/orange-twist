import { ObjectStoreName } from '../ObjectStoreName';

/**
 * Initialise the Orange Twist database to the v1 schema on first load.
 */
export function migrateToV1(db: IDBDatabase): void {
	db.createObjectStore(ObjectStoreName.DATA);
	db.createObjectStore(ObjectStoreName.IMAGES);
}
