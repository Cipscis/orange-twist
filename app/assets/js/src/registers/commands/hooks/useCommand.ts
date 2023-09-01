import { useEffect } from 'preact/hooks';

import {
	CommandId,
	CommandListener,
	addCommandListener,
	removeCommandListener,
} from '../commandsRegister.js';

// Ensure listed commands have been registered
import '../commands/index.js';

export function useCommand<C extends CommandId>(commandId: C, listener: CommandListener<C>) {
	useEffect(() => {
		addCommandListener(commandId, listener);

		return () => {
			removeCommandListener(commandId, listener);
		};
	}, [commandId, listener]);
}
