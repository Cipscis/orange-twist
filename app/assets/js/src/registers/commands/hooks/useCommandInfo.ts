import { useCallback, useEffect, useState } from 'preact/hooks';

import type { CommandInfo } from '../types/CommandInfo';
import type { CommandId } from '../types/CommandId';

import { commandsRegister } from '../commandsRegister';
import { getCommandInfo } from '../getCommandInfo';

/**
 * Provides up to date information on all registered commands.
 */
export function useCommandInfo(): CommandInfo[];
/**
 * Provides up to date information on a single registered command.
 *
 * @param command A string ID identifying a command.
 */
export function useCommandInfo(command: CommandId): CommandInfo | null;
export function useCommandInfo(
	command?: CommandId
): CommandInfo[] | CommandInfo | null {
	/**
	 * A wrapper around {@linkcode getCommandInfo} with the hook's {@linkcode command}
	 * argument baked into it.
	 */
	const getThisCommandInfo = useCallback(() => {
		if (command) {
			return getCommandInfo(command);
		} else {
			return getCommandInfo();
		}
	}, [command]);

	const [commandInfo, setCommandInfo] = useState(getThisCommandInfo);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		commandsRegister.addEventListener(
			'set',
			() => setCommandInfo(getThisCommandInfo()),
			{ signal }
		);

		commandsRegister.addEventListener(
			'delete',
			() => setCommandInfo(getThisCommandInfo()),
			{ signal }
		);

		return () => controller.abort();
	}, [getThisCommandInfo]);

	return commandInfo;
}
