import { CommandId } from './CommandId.js';

export type Command<C extends CommandId = CommandId> = {
	id: C;
	name: string;
};
