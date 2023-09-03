import { CommandId } from './CommandId.js';

export type CommandInfo<C extends CommandId = CommandId> = {
	id: C;
	name: string;
};
