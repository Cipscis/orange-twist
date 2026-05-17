import { migrateToV1 } from './migrateToV1';
import { migrateToV2 } from './migrateToV2';

/**
 * Migrate the Orange Twist database from its previous version, if any, to the current latest version.
 */
export function migrateToLatest(
	e: IDBVersionChangeEvent,
	db: IDBDatabase
): void {
	const oldVersion = e.oldVersion;
	// Handle `null` case used when deleting a database
	const newVersion = Number(e.newVersion);

	if (oldVersion < 1 && newVersion >= 1) {
		migrateToV1(db);
	}

	if (oldVersion < 2 && newVersion >= 2) {
		migrateToV2(db);
	}
}
