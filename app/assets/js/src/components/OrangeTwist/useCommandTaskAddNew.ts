import { useCallback, useEffect } from 'preact/hooks';

import { createTask, setDayTaskInfo } from 'data';

import {
	fireCommand,
	registerCommand,
	useCommand,
} from 'registers/commands';
import { Command } from 'types/Command';

import * as ui from 'ui';

/**
 * Register the "Add new task" command.
 */
export function useCommandTaskAddNew(): void {
	useEffect(() => {
		registerCommand(Command.TASK_ADD_NEW, { name: 'Add new task' });
	}, []);

	/**
	 * Ask the user what name to use for a new task, then add it to the register.
	 */
	const createNewTask = useCallback(async (dayName?: string) => {
		const name = await ui.prompt('Task name', {
			type: ui.PromptType.TEXT,
		});
		if (!name) {
			return;
		}

		const taskId = createTask({ name });
		if (dayName) {
			setDayTaskInfo({ dayName, taskId }, {});
		}

		fireCommand(Command.DATA_SAVE);
	}, []);

	useCommand(Command.TASK_ADD_NEW, createNewTask);
}
