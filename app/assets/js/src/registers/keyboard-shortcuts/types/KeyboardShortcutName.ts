import type { EnumTypeOf } from 'util/index';

export const KeyboardShortcutName = {
	COMMAND_PALETTE_OPEN: 'Open command palette',

	DATA_SAVE: 'Save data',

	KEYBOARD_SHORTCUTS_MODAL_OPEN: 'Open keyboard shortcuts modal',

	EDITING_FINISH: 'Finish editing',
} as const;
// Allow any string
/* eslint-disable-next-line @typescript-eslint/ban-types */
export type KeyboardShortcutName = EnumTypeOf<typeof KeyboardShortcutName> | (string & {});
