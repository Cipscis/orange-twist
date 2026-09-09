import type { EnumTypeOf } from 'utils';

/**
 * **Important:** Status icons reflect values in the database, so should not be changed or removed without a corresponding database migration.
 */
export const IconName = {
	// Statuses
	TODO: 'todo',
	IN_PROGRESS: 'in progress',
	COMPLETED: 'completed',
	INVESTIGATING: 'investigating',
	IN_REVIEW: 'in review',
	TESTING: 'testing',
	PAUSED: 'paused',
	APPROVED: 'approved',
	WILL_NOT_DO: 'will-not-do',

	// Chevrons
	CHEVRON_UP: 'chevron up',
	CHEVRON_RIGHT: 'chevron right',
	CHEVRON_DOWN: 'chevron down',
	CHEVRON_LEFT: 'chevron left',

	// Actions
	FILE: 'file',
	EDIT: 'edit',
	DELETE: 'delete',
	CLOSE: 'close',
} as const;
export type IconName = EnumTypeOf<typeof IconName>;
