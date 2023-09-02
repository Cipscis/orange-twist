import { useState } from 'preact/hooks';

import { Command } from '../types/index.js';
import { getCommands } from '../commandsRegister.js';
import { onNewCommandRegistered } from '../listeners/onNewCommandRegistered.js';

export function useCommands(): ReadonlyArray<Readonly<Command>> {
	// Try to initialise with existing data
	const [commands, setCommands] = useState<ReadonlyArray<Readonly<Command>>>(getCommands);

	// Update commands whenever a new one is added
	onNewCommandRegistered((newCommand) => {
		setCommands(
			(commands) => commands.concat(newCommand)
		);
	});

	return commands;
}
