import { useState } from 'preact/hooks';

import { CommandInfo } from '../types/index.js';
import { getCommands } from '../commandsRegister.js';
import { onNewCommandRegistered } from '../listeners/onNewCommandRegistered.js';

export function useCommands(): ReadonlyArray<Readonly<CommandInfo>> {
	// Try to initialise with existing data
	const [commands, setCommands] = useState<ReadonlyArray<Readonly<CommandInfo>>>(getCommands);

	// Update commands whenever a new one is added
	onNewCommandRegistered((newCommand) => {
		setCommands(
			(commands) => commands.concat(newCommand)
		);
	});

	return commands;
}
