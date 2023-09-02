/**
 * A key and any relevant modifier keys to be used in a keyboard shortcut.
 */
export type KeyCombo = {
	key: KeyboardEvent['key'];
	/**
	 * Whether or not the Ctrl / Cmd key must be pressed for this key combo to fiie
	 * @default false
	 */
	ctrl?: boolean;
	/**
	 * Whether or not the Alt key must be pressed for this key combo to fiie
	 * @default false
	 */
	alt?: boolean;
	/**
	 * Whether or not the Shift key must be pressed for this key combo to fiie
	 * @default false
	 */
	shift?: boolean;
};
