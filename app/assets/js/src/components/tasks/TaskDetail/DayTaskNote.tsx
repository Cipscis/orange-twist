import { h, type JSX } from 'preact';
import { useCallback, useContext } from 'preact/hooks';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { setDayTaskInfo, type DayTaskInfo } from 'data';

import { OrangeTwistContext } from 'components/OrangeTwistContext';
import { Note } from 'components/shared';

interface DayTaskNoteProps {
	dayTask: Readonly<DayTaskInfo>;
}

export function DayTaskNote(props: DayTaskNoteProps): JSX.Element {
	const { dayTask } = props;
	const { dayName, taskId } = dayTask;

	// Reload when all data is loaded, to make sure it's all displayed correctly
	useContext(OrangeTwistContext);

	const setDayTaskNote = useCallback((note: string) => {
		setDayTaskInfo({ dayName, taskId }, { note });
	}, [dayName, taskId]);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

	return <Note
		note={dayTask.note}
		onNoteChange={setDayTaskNote}
		saveChanges={saveChanges}
	/>;
}
