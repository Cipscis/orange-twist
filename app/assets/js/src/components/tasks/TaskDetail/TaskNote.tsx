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

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import type { MarkdownApi } from 'components/shared/Markdown';
import { Note } from 'components/shared';

interface TaskNoteProps {
	task: Readonly<TaskInfo>;
}

export function TaskNote(props: TaskNoteProps): JSX.Element {
	const { task } = props;

	const { isLoading } = useContext(OrangeTwistContext);

	const setTaskNote = useCallback(
		(note: string) => {
			setTaskInfo(task.id, { note });
		},
		[task.id]
	);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

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
