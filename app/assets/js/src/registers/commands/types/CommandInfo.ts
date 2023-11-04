import type { CommandId } from './CommandId';
import type { CommandRegistration } from './CommandRegistration';

/**
 * The public interface describing a registered command.
 */
export type CommandInfo<
	C extends CommandId = CommandId
> = Readonly<
	Pick<
		CommandRegistration<C>,
		'id' | 'name' | 'shortcuts'
	>
>;
