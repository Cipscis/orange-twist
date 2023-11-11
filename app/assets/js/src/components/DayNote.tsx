import { h, type JSX } from 'preact';

import type { DayInfo } from 'registers/days';

import { Command } from 'types/Command';

import { setDayInfo } from 'registers/days';
import { fireCommand } from 'registers/commands';

import { Note } from './shared/Note';

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
		onNoteChange={(note) => setDayInfo(name, { note })}
		saveChanges={() => fireCommand(Command.DATA_SAVE)}
	/>;
}
