import { useEffect } from 'preact/hooks';

import { CommandWithListener } from '../types/index.js';

import { addCommandListener, removeCommandListener } from '../listeners/addCommandListener.js';

export function useCommand(...[commandId, listener]: CommandWithListener) {
	useEffect(() => {
		addCommandListener(commandId, listener);

		return () => {
			removeCommandListener(commandId, listener);
		};
	}, [commandId, listener]);
}
