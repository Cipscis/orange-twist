import { h, type JSX } from 'preact';

import { useSettableTask } from 'database';

import type { InlineNote } from 'components/shared';
import { SettableTaskNameLoader } from './SettableTaskNameLoader';

export interface SettableTaskNameProps {
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

	const taskDataState = useSettableTask(taskId);

	return <SettableTaskNameLoader
		taskId={taskId}
		taskDataState={taskDataState}
	/>;
};
