import { useEffect } from 'preact/hooks';

import { CommandWithListener } from '../types/index.js';

import { addCommandListener } from '../listeners/addCommandListener.js';

/**
 * Bind a listener function to be called whenever a specified
 * command is fired.
 */
export function useCommand(...[commandId, listener]: CommandWithListener) {
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		addCommandListener(commandId, listener, { signal });

		return () => controller.abort();
	}, [commandId, listener]);
}
