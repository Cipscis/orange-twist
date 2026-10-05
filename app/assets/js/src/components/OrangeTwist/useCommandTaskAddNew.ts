import { useCallback, useEffect } from 'preact/hooks';

import { createTask, setDayTaskInfo } from 'data';
import { SaveType } from 'database';

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

		// TODO: Take a day ID instead, and do this via SaveAction
		if (dayName) {
			const taskId = createTask({ name });
			setDayTaskInfo({ dayName, taskId }, {});
			fireCommand(Command.DATA_SAVE);
			return;
		}

		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.TASK_ADD,
			task: { name },
		}]);
	}, []);

	useCommand(Command.TASK_ADD_NEW, createNewTask);
}
