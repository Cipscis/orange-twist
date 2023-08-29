import { registerCommand } from '../commandsRegister.js';

declare module '../commandsRegister.js' {
	interface CommandsList {
		'add-new-task': {
			name: 'Add new task';
		};
	}
}

registerCommand({
	id: 'add-new-task',
	name: 'Add new task',
});
