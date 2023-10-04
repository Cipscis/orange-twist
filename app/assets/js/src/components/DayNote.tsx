import { h } from 'preact';

import { Day } from '../types/Day.js';

import { setDayData } from '../registers/days/index.js';
import { Command, fireCommand } from '../registers/commands/index.js';
import { Note } from './Note.js';

interface DayNoteProps {
	day: Readonly<Day>;
}

export function DayNote(props: DayNoteProps) {
	const { day } = props;
	const { dayName } = day;

	return <Note
		note={day.note}
		onNoteChange={(note) => setDayData(dayName, { note })}
		saveChanges={() => fireCommand(Command.DATA_SAVE)}
	/>;
}
