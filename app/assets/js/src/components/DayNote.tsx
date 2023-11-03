import { h } from 'preact';

import type { Day } from '../types/Day';

import { setDayData } from '../registers/days';
import { Command, fireCommand } from '../registers/commands';

import { Note } from './shared/Note';

interface DayNoteProps {
	day: Readonly<Day>;
}

/**
 * Renders a note for a specified day, including the ability to
 * edit that note.
 */
export function DayNote(props: DayNoteProps) {
	const { day } = props;
	const { dayName } = day;

	return <Note
		note={day.note}
		onNoteChange={(note) => setDayData(dayName, { note })}
		saveChanges={() => fireCommand(Command.DATA_SAVE)}
	/>;
}
