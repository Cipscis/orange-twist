import { EnumTypeOf } from '../../../util/index.js';

export const KeyboardShortcutName = {
	COMMAND_PALETTE_OPEN: 'Open command palette',

	DATA_SAVE: 'Save data',

	KEYBOARD_SHORTCUTS_MODAL_OPEN: 'Open keyboard shortcuts modal',
} as const;
// Allow any string
/* eslint-disable-next-line @typescript-eslint/ban-types */
export type KeyboardShortcutName = EnumTypeOf<typeof KeyboardShortcutName> | (string & {});
