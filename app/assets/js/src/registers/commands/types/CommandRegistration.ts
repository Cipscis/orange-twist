import type { KeyboardShortcutName } from 'registers/keyboard-shortcuts';

import type { CommandId } from './CommandId';
import type { CommandsList } from './CommandsList';

/**
 * The complete description of a registered command.
 */
export type CommandRegistration<
	C extends CommandId = CommandId
> = {
	/** The unique string ID of the command. */
	id: C;
	/** A user-friendly string for the command's name. */
	name: string;
	/** Keyboard shortcuts that will fire the command. */
	shortcuts: Set<KeyboardShortcutName>;

	/** All bound listeners that will be called when the command is fired. */
	listeners: Set<(...args: CommandsList[C] | []) => void>;
};
