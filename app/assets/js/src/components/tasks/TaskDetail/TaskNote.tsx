import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'preact/hooks';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { setTaskInfo, type TaskInfo } from 'data';
import { SaveType } from 'database';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import type { MarkdownApi } from 'components/shared/Markdown';
import { Note } from 'components/shared';

interface TaskNoteProps {
	task: Readonly<TaskInfo>;
}

export function TaskNote(props: TaskNoteProps): JSX.Element {
	const { task } = props;

	const { isLoading } = useContext(OrangeTwistContext);
	/** Keep a reference to the note for immediate saving before re-renredering. */
	const noteRef = useRef(task.note);
	// Make sure to update the ref if the task note changes from other sources
	useEffect(() => {
		noteRef.current = task.note;
	}, [task.note]);

	const setTaskNote = useCallback(
		(note: string) => {
			noteRef.current = note;
			setTaskInfo(task.id, { note });
		},
		[task.id]
	);

	const saveChanges = useCallback(() => {
		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.TASK,
			id: task.id,
			task: { note: noteRef.current },
		}]);
	}, [task.id]);

	const markdownApiRef = useRef<MarkdownApi | null>(null);
	// When data is finished loading re-render Markdown
	useEffect(() => {
		if (!isLoading) {
			markdownApiRef.current?.rerender();
		}
	}, [isLoading]);

	return <Note
		class="task-detail__note"
		note={task.note}
		onNoteChange={setTaskNote}
		saveChanges={saveChanges}
		markdownApiRef={markdownApiRef}
	/>;
}
