import { useCallback, useEffect, useState } from 'preact/hooks';

import type { CommandInfo } from '../types/CommandInfo';
import type { CommandId } from '../types/CommandId';

import { commandsRegister } from '../commandsRegister';
import { getCommandInfo } from '../getCommandInfo';

export function useCommandInfo(): CommandInfo[]
export function useCommandInfo(command: CommandId): CommandInfo | null
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
			'change',
			() => setCommandInfo(getThisCommandInfo()),
			{ signal }
		);

		return () => controller.abort();
	}, [getThisCommandInfo]);

	return commandInfo;
}
