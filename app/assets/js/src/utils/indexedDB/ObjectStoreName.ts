import type { EnumTypeOf } from 'utils/EnumTypeOf';

/**
 * The names of object stores within Orange Twist's IndexedDB database.
 */
export const ObjectStoreName = {
	DATA: 'data',
} as const;
export type ObjectStoreName = EnumTypeOf<typeof ObjectStoreName>;
