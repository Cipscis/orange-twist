import type { EnumTypeOf } from 'utils';

export const Command = {
	DAY_ADD_NEW: 'day-add-new',
	TASK_ADD_NEW: 'task-add-new',
	DATA_SAVE: 'data-save',
	DATA_EXPORT: 'data-export',
	DATA_IMPORT: 'data-import',
	THEME_TOGGLE: 'theme-toggle',
	KEYBOARD_SHORTCUT_SHOW: 'keyboard-shortcut-show',
} as const;
export type Command = EnumTypeOf<typeof Command>;

declare module 'registers/commands' {
	interface CommandsList {
		[Command.DAY_ADD_NEW]: [dayName: string];
		[Command.TASK_ADD_NEW]: [dayName: string];
		[Command.DATA_SAVE]: [];
		[Command.DATA_EXPORT]: [];
		[Command.DATA_IMPORT]: [];
		[Command.THEME_TOGGLE]: [];
		[Command.KEYBOARD_SHORTCUT_SHOW]: [];
	}
}
