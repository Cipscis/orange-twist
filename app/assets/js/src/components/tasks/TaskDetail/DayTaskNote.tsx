import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'preact/hooks';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { setDayTaskInfo, type DayTaskInfo } from 'data';
import { SaveType } from 'database';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import type { MarkdownApi } from 'components/shared/Markdown';
import { Note } from 'components/shared';

interface DayTaskNoteProps {
	dayTask: Readonly<DayTaskInfo>;
}

export function DayTaskNote(props: DayTaskNoteProps): JSX.Element {
	const { dayTask } = props;
	const { dayName, taskId } = dayTask;

	const { isLoading } = useContext(OrangeTwistContext);
	/** Keep a reference to the note for immediate saving before re-rendering. */
	const noteRef = useRef(dayTask.note);
	// Make sure to update the ref if the day task note changes from other sources
	useEffect(() => {
		noteRef.current = dayTask.note;
	}, [dayTask.note]);

	const setDayTaskNote = useCallback(
		(note: string) => {
			noteRef.current = note;
			setDayTaskInfo({ dayName, taskId }, { note });

			fireCommand(Command.DATA_SAVE, [{
				type: SaveType.DAY_TASK_LEGACY,
				dayName,
				taskId,
				dayTask: { note: noteRef.current },
			}]);
		},
		[dayName, taskId]
	);

	const markdownApiRef = useRef<MarkdownApi | null>(null);
	// When data is finished loading re-render Markdown
	useEffect(() => {
		if (!isLoading) {
			markdownApiRef.current?.rerender();
		}
	}, [isLoading]);

	return <Note
		note={dayTask.note}
		onNoteChange={setDayTaskNote}
		markdownApiRef={markdownApiRef}
	/>;
}
