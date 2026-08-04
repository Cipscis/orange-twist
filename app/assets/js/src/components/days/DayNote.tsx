import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setDayInfo,
	type DayInfo,
} from 'data';
import { SaveType } from 'database';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import type { MarkdownApi } from 'components/shared/Markdown';
import { Note } from 'components/shared';

interface DayNoteProps {
	day: Readonly<DayInfo>;
}

/**
 * Renders a note for a specified day, including the ability to
 * edit that note.
 */
export function DayNote(props: DayNoteProps): JSX.Element {
	const { day } = props;
	const { name } = day;

	const { isLoading } = useContext(OrangeTwistContext);
	/** Keep a reference to the note for immediate saving before re-renredering. */
	const noteRef = useRef(day.note);
	// Make sure to update the ref if the task note changes from other sources
	useEffect(() => {
		noteRef.current = day.note;
	}, [day.note]);

	const onNoteChange = useCallback(
		(note: string) => {
			noteRef.current = note;
			setDayInfo(name, { note });
		},
		[name]
	);

	const saveChanges = useCallback(() => {
		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.DAY_LEGACY,
			dayName: day.name,
			day: { note: noteRef.current },
		}]);
	}, [day.name]);

	const markdownApiRef = useRef<MarkdownApi | null>(null);
	// When data is finished loading re-render Markdown
	useEffect(() => {
		if (!isLoading) {
			markdownApiRef.current?.rerender();
		}
	}, [isLoading]);

	return <Note
		note={day.note}
		onNoteChange={onNoteChange}
		saveChanges={saveChanges}
		markdownApiRef={markdownApiRef}
	/>;
}
