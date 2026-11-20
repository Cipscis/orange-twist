import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import type { DayTask } from 'database';

import { Note } from 'components/shared';

interface SettableDayTaskNoteSyncProps {
	dayTask: Readonly<Pick<DayTask, 'id' | 'note'>>;
	setDayTask: (date: Partial<Pick<DayTask, 'id' | 'note'>>) => Promise<void>;
}

export function SettableDayTaskNoteSync(props: SettableDayTaskNoteSyncProps): JSX.Element {
	const {
		dayTask,
		setDayTask,
	} = props;

	const setDayTaskNote = useCallback(async (note: string) => {
		await setDayTask({ note });
	}, [setDayTask]);

	return <Note
		note={dayTask.note}
		onNoteChange={setDayTaskNote}
	/>;
}
