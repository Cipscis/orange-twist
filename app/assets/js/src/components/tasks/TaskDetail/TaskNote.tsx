import { h, type JSX } from 'preact';
import { useCallback, useContext } from 'preact/hooks';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { setTaskInfo, type TaskInfo } from 'data';

import { OrangeTwistContext } from 'components/OrangeTwistContext';
import { Note } from 'components/shared';

interface TaskNoteProps {
	task: Readonly<TaskInfo>;
}

export function TaskNote(props: TaskNoteProps): JSX.Element {
	const { task } = props;

	// Reload when all data is loaded, to make sure it's all displayed correctly
	useContext(OrangeTwistContext);

	const setTaskNote = useCallback(
		(note: string) => {
			setTaskInfo(task.id, { note });
		},
		[task.id]
	);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

	return <Note
		class="task-detail__note"
		note={task.note}
		onNoteChange={setTaskNote}
		saveChanges={saveChanges}
	/>;
}
