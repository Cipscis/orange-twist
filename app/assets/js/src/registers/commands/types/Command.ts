import type { EnumTypeOf } from 'util/index';

/**
 * An enum of names of built-in commands.
 */
export const Command = {
	DAY_ADD_NEW: 'day-add-new',
	TASK_ADD_NEW: 'task-add-new',
	DATA_SAVE: 'data-save',
	THEME_TOGGLE: 'theme-toggle',
} as const;
export type Command = EnumTypeOf<typeof Command>;
