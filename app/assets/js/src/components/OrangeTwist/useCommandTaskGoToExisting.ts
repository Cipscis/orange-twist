import { useCallback, useEffect } from 'preact/hooks';

import { registerCommand, useCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { getTaskDetailUrl } from 'navigation';

import * as ui from 'ui';

/**
 * Register the "Go to task" command.
 */
export function useCommandTaskGoToExisting(): void {
	useEffect(() => {
		registerCommand(Command.TASK_GO_TO_EXISTING, { name: 'Go to task' });
	}, []);

	/**
	 * Prompt the user to select a task, then navigate to it.
	 */
	const goToTask = useCallback(async () => {
		const taskId = await ui.prompt('Task name', {
			type: ui.PromptType.TASK,
		});
		if (taskId === null) {
			return;
		}

		// Navigate to task URL
		const path = getTaskDetailUrl(taskId);
		if (window.navigation) {
			window.navigation.navigate(path);
		} else {
			window.location.href = path;
		}
	}, []);

	useCommand(Command.TASK_GO_TO_EXISTING, goToTask);
}
