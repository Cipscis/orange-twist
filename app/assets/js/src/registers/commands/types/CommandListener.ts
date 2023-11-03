import type { CommandId } from './CommandId';
import type { CommandsList } from './CommandsList';

export type CommandListener<C extends CommandId = CommandId> = (...args: CommandsList[C] | []) => void;
