import { h, type JSX } from 'preact';
import { useCallback, useContext } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setDayInfo,
	type DayInfo,
} from 'data';

import { OrangeTwistContext } from 'components/OrangeTwistContext';
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

	// Reload when all data is loaded, to make sure it's all displayed correctly
	useContext(OrangeTwistContext);

	const onNoteChange = useCallback(
		(note: string) => setDayInfo(name, { note }),
		[name]
	);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

	return <Note
		note={day.note}
		onNoteChange={onNoteChange}
		saveChanges={saveChanges}
	/>;
}
