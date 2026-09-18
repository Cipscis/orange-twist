import {
	h,
	Fragment,
	type JSX,
} from 'preact';
import { useCallback } from 'preact/hooks';

import { AsyncDataStateType } from 'utils';
import {
	SaveType,
	useSettableTask,
} from 'database';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import * as ui from 'ui';
import {
	InlineNote,
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';

interface SettableTaskNameProps {
	taskId: number;
}

/**
 * Renders an {@linkcode InlineNote} of a specified task's name, allowing for the name to be edited.
 *
 * If the name is removed altogether, shows a prompt asking the user to confirm deleting the task.
 */
export const SettableTaskName = (props: SettableTaskNameProps): JSX.Element => {
	const {
		taskId,
	} = props;

	const {
		setData,
		stateOfGet,
	} = useSettableTask(taskId);

	const nameChangeHandler = useCallback(async (name: string) => {
		if (name === '') {
			if (await ui.confirm('Delete this task?')) {
				fireCommand(Command.DATA_SAVE, [{
					type: SaveType.TASK_DELETE,
					id: taskId,
				}]);
			}
			return;
		}

		setData({ name });
	}, [taskId, setData]);

	return <>
		{
			stateOfGet.type === AsyncDataStateType.INITIAL &&
			<Loader />
		}

		{
			stateOfGet.type === AsyncDataStateType.SUCCESS &&
			stateOfGet.data &&
			<InlineNote
				note={stateOfGet.data.name}
				onNoteChange={nameChangeHandler}

				placeholder="Task name"
				editButtonTitle="Edit task name"

				class="task__name"
			/>
		}

		{
			!(
				stateOfGet.type === AsyncDataStateType.INITIAL ||
				(
					stateOfGet.type === AsyncDataStateType.SUCCESS &&
					stateOfGet.data
				)
			) && <Notice
				variant={NoticeVariant.ERROR}
				message={`Failed to load task with ID ${taskId}`}
				dataTestid="settable-task-name__error-notice"
			/>
		}
	</>;
};
