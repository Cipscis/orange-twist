import { CommandId } from './CommandId.js';
import { CommandsList } from './CommandsList.js';

export type CommandListener<C extends CommandId = CommandId> = (...args: CommandsList[C] | []) => void;
