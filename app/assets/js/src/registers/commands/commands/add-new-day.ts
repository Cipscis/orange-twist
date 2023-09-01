import { registerCommand } from '../commandsRegister.js';

declare module '../commandsRegister.js' {
	interface CommandsList {
		'add-new-day': {
			name: 'Add new day';
			arguments: [dayName: string];
		};
	}
}

registerCommand({
	id: 'add-new-day',
	name: 'Add new day',
});
