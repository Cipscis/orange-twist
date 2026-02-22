import type { EnumTypeOf } from 'utils';

export const Command = {
	DAY_ADD_NEW: 'day-add-new',
	TASK_ADD_NEW: 'task-add-new',
	TASK_GO_TO_EXISTING: 'task-go-to-existing',
	DATA_SAVE: 'data-save',
	DATA_EXPORT: 'data-export',
	DATA_IMPORT: 'data-import',
	THEME_TOGGLE: 'theme-toggle',
	KEYBOARD_SHORTCUT_SHOW: 'keyboard-shortcut-show',
	TEMPLATES_EDIT: 'templates-edit',
} as const;
export type Command = EnumTypeOf<typeof Command>;

declare module 'registers/commands' {
	interface CommandsList {
		[Command.DAY_ADD_NEW]: [dayName: string];
		[Command.TASK_ADD_NEW]: [dayName: string];
		[Command.TASK_GO_TO_EXISTING]: [taskId: number];
		[Command.DATA_SAVE]: [];
		[Command.DATA_EXPORT]: [];
		[Command.DATA_IMPORT]: [];
		[Command.THEME_TOGGLE]: [];
		[Command.KEYBOARD_SHORTCUT_SHOW]: [];
		[Command.TEMPLATES_EDIT]: [];
	}
}
