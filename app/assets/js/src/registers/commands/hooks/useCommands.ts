import { useState } from 'preact/hooks';

import { CommandEntry, getCommands } from '../commandsRegister.js';
import { onNewCommandRegistered } from '../listeners/onNewCommandRegistered.js';

export function useCommands(): ReadonlyArray<Readonly<CommandEntry>> {
	// Try to initialise with existing data
	const [commands, setCommands] = useState<ReadonlyArray<Readonly<CommandEntry>>>(getCommands);

	// Update commands whenever a new one is added
	onNewCommandRegistered((newCommand) => {
		setCommands(() => getCommands());
	});

	return commands;
}
