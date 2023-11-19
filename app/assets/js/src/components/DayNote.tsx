import { h, type JSX } from 'preact';

import type { DayInfo } from 'data/days';

import { Command } from 'types/Command';

import { setDayInfo } from 'data/days';
import { fireCommand } from 'registers/commands';

import { Note } from './shared/Note';
import { useCallback } from 'preact/hooks';

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

	return <Note
		note={day.note}
		onNoteChange={useCallback(
			(note) => setDayInfo(name, { note }),
			[name]
		)}
		saveChanges={useCallback(() => fireCommand(Command.DATA_SAVE), [])}
	/>;
}
