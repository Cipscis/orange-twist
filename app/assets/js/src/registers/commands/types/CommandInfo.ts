import type { CommandId } from './CommandId';

export type CommandInfo<C extends CommandId = CommandId> = {
	id: C;
	name: string;
};
