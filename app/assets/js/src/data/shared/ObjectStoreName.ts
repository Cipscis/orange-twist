import type { EnumTypeOf } from 'utils/EnumTypeOf';

/**
 * The names of object stores within Orange Twist's IndexedDB database.
 */
export const ObjectStoreName = {
	DAY: 'day',
	TASK: 'task',
	DAY_TASK: 'day_task',
	STATUS: 'status',
	TEMPLATE: 'template',
	IMAGE: 'image',

	/**
	 * Main table from v1
	 * @deprecated
	 */
	DATA: 'data',
	/**
	 * Images table from v2
	 * @deprecated
	 */
	IMAGES: 'images',
} as const;
export type ObjectStoreName = EnumTypeOf<typeof ObjectStoreName>;
