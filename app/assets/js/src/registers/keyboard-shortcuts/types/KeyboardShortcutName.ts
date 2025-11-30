import type { EnumTypeOf } from 'utils';

export const KeyboardShortcutName = {
	COMMAND_PALETTE_OPEN: 'Open command palette',

	DATA_SAVE: 'Save data',

	KEYBOARD_SHORTCUTS_MODAL_OPEN: 'Open keyboard shortcuts modal',

	EDITING_FINISH: 'Finish editing',
} as const;
// Allow any string
export type KeyboardShortcutName = EnumTypeOf<typeof KeyboardShortcutName> | (string & {});
