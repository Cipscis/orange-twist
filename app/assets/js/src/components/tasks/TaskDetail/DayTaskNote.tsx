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

	const setDayTaskNote = useCallback((note: string) => {
		setDayTaskInfo({ dayName, taskId }, { note });
	}, [dayName, taskId]);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

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
		saveChanges={saveChanges}
		markdownApiRef={markdownApiRef}
	/>;
}
