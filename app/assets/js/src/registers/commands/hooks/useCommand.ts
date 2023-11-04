import { useEffect } from 'preact/hooks';

import type { CommandsList } from '../types/CommandsList';
import type { CommandId } from '../types/CommandId';

import { addCommandListener } from '../listeners/addCommandListener';

type UseCommandArgs = {
	[C in CommandId]: [
		command: C,
		listener: (...args: CommandsList[C] | []) => void
	]
}[CommandId];

/**
 * Binds a listener to a specified command.
 *
 * It's important that the command should be registered first. Also,
 * the listener should be memoised, otherwise it will be re-bound each
 * time your component is rendered.
 *
 * @param command A string ID identifying a command.
 * @param listener A function to be called whenever the specified command is fired.
 *
 * @example
 * ```tsx
 * const commandListener = useCallback(() => {
 *     // ...
 * }, [dependencies]);
 *
 * useCommand('my-command-name', commandListener);
 * ```
 */
export function useCommand(...[command, listener]: UseCommandArgs): void {
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		// This type assertion is safe because it's asserting the arguments tuple is its declared type
		// It's also necessary because TypeScript can't tell here that the destructured types are linked
		addCommandListener(...[command, listener] as UseCommandArgs, { signal });

		return () => controller.abort();
	}, [command, listener]);
}
