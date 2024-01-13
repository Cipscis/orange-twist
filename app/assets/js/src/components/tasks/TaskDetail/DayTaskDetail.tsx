import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setDayTaskInfo,
	type DayTaskInfo,
} from 'data';

import { Note } from 'components/shared/Note';

interface DayTaskDetailProps {
	dayTaskInfo: DayTaskInfo;
}

export function DayTaskDetail(props: DayTaskDetailProps): JSX.Element {
	const { dayName, taskId, note } = props.dayTaskInfo;

	return <>
		<Note
			note={note}
			onNoteChange={useCallback((note: string) => {
				setDayTaskInfo({ dayName, taskId }, { note });
			}, [dayName, taskId])}
			saveChanges={useCallback(() => {
				fireCommand(Command.DATA_SAVE);
			}, [])}
		/></>;
}
