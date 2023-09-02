import { EnumTypeOf } from '../../../util/EnumTypeOf.js';

export const KeyboardShortcutName = {
	COMMAND_PALETTE_OPEN: 'Open command palette',

	DATA_SAVE: 'Save data',
} as const;
// Allow any string
/* eslint-disable-next-line @typescript-eslint/ban-types */
export type KeyboardShortcutName = EnumTypeOf<typeof KeyboardShortcutName> | (string & {});
