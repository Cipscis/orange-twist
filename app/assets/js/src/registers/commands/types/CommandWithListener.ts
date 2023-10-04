import { CommandId } from './CommandId.js';
import { CommandListener } from './CommandListener.js';

/**
 * A discriminated union of tuple types that can be used when defining
 * functions that accept a command ID and a listener associated with
 * that command as arguments.
 *
 * @example
 * ```typescript
 * declare function addCommandListener([commandId, listener]: CommandWithListener): void;
 * ```
 */
export type CommandWithListener = {
	[C in CommandId]: [commandId: C, listener: CommandListener<C>];
}[CommandId];
