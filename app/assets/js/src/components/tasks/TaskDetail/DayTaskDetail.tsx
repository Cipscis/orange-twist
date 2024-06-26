import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setDayTaskInfo,
	type DayTaskInfo,
} from 'data';

import {
	InlineNote,
} from 'components/shared';
import { TaskStatusComponent } from '../TaskStatusComponent';
import { DayTaskNote } from './DayTaskNote';

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
	} = dayTaskInfo;

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

	return <details
		key={dayName}
		class="day js-day"
		open={open}
	>
		<summary class="day__summary">
			<TaskStatusComponent
				taskId={taskId}
				dayName={dayTaskInfo.dayName}
			/>
			<h3 class="day__heading">{dayTaskInfo.dayName}</h3>
			<InlineNote
				note={dayTaskInfo.summary}
				onNoteChange={useCallback((summary: string | null) => {
					setDayTaskInfo(dayTaskInfo, { summary });
				}, [dayTaskInfo])}
				saveChanges={saveChanges}
				editButtonTitle="Edit summary"
				placeholder="Summary"
			/>
		</summary>

		<div class="day__body">
			<DayTaskNote dayTask={dayTaskInfo} />
		</div>
	</details>;
}
