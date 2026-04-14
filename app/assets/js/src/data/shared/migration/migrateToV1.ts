import { ObjectStoreName } from '../ObjectStoreName';

/**
 * Initialise the Orange Twist database to the v1 schema on first load.
 */
export function migrateToV1(db: IDBDatabase): void {
	// Create the "data" object store when database is first created
	console.log('initialising DB v1...');
	db.createObjectStore(ObjectStoreName.DATA);
	db.createObjectStore(ObjectStoreName.IMAGES);
	console.log('initialised DB v1');
}
