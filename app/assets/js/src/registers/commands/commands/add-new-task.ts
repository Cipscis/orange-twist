import { Command } from '../types/Command.js';
import { registerCommand } from '../commandsRegister.js';

registerCommand({
	id: Command.TASK_ADD_NEW,
	name: 'Add new task',
});
