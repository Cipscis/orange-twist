import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setDayTaskInfo,
	type DayTaskInfo,
} from 'data';

import { Note } from 'components/shared/Note';
import { TaskStatusComponent } from '../TaskStatusComponent';

interface DayTaskDetailProps {
	dayTaskInfo: DayTaskInfo;
	open?: boolean;
}

export function DayTaskDetail(props: DayTaskDetailProps): JSX.Element {
	const {
		dayTaskInfo,
		open,
	} = props;
	const {
		dayName,
		taskId,
		note,
	} = dayTaskInfo;

	return <details
		key={dayName}
		class="day"
		open={open}
	>
		<summary class="day__summary">
			<TaskStatusComponent
				taskId={taskId}
				dayName={dayTaskInfo.dayName}
			/>
			<h3 class="day__heading">{dayTaskInfo.dayName}</h3>
		</summary>

		<div class="day__body">
			<Note
				note={note}
				onNoteChange={useCallback((note: string) => {
					setDayTaskInfo({ dayName, taskId }, { note });
				}, [dayName, taskId])}
				saveChanges={useCallback(() => {
					fireCommand(Command.DATA_SAVE);
				}, [])}
			/>
		</div>
	</details>;
}
