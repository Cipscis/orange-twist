import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import type { Task } from 'database';

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

	const nameChangeHandler = useCallback((name: string) => {
		if (name === '') {
			// If the name is empty, cancel the edit operation
			return;
		}

		setData({ name });
	}, [setData]);

	return <InlineNote
		note={task.name}
		onNoteChange={nameChangeHandler}

		placeholder="Task name"
		editButtonTitle="Edit task name"

		class="task__name"
	/>;
}
