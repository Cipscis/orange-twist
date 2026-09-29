import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import type { Task } from 'database';

import { Note } from 'components/shared';

interface TaskNoteSyncProps {
	task: Task;
	setData: (data: Partial<Task>) => Promise<void>;
}

export function TaskNoteSync(props: TaskNoteSyncProps): JSX.Element {
	const {
		task,
		setData,
	} = props;

	const setTaskNote = useCallback(
		async (note: string) => {
			await setData({ note });
		},
		[setData]
	);

	return <Note
		class="task-detail__note"
		note={task.note}
		onNoteChange={setTaskNote}
	/>;
}
