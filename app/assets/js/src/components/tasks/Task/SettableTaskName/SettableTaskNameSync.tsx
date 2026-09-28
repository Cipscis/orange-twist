import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { SaveType, type Task } from 'database';

import * as ui from 'ui';
import { InlineNote } from 'components/shared';

interface SettableTaskNameSyncProps {
	task: Task;
	setData: (data: Partial<Task>) => Promise<void>;
}

export function SettableTaskNameSync(
	props: SettableTaskNameSyncProps,
): JSX.Element {
	const {
		task,
		setData,
	} = props;

	const nameChangeHandler = useCallback(async (name: string) => {
		if (name === '') {
			if (await ui.confirm('Delete this task?')) {
				fireCommand(Command.DATA_SAVE, [{
					type: SaveType.TASK_DELETE,
					id: task.id,
				}]);
			}
			return;
		}

		setData({ name });
	}, [task.id, setData]);

	return <InlineNote
		note={task.name}
		onNoteChange={nameChangeHandler}

		placeholder="Task name"
		editButtonTitle="Edit task name"

		class="task__name"
	/>;
}
