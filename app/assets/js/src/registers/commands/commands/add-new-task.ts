import { Command } from '../types/Command';
import { registerCommand } from '../commandsRegister';

registerCommand({
	id: Command.TASK_ADD_NEW,
	name: 'Add new task',
});
