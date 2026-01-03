import {
	h,
	Fragment,
	type JSX,
} from 'preact';
import { useCallback, useState } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setDayTaskInfo,
	type DayTaskInfo,
} from 'data';

import {
	Accordion,
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

	const [summary, setSummary] = useState(dayTaskInfo.summary);

	/**
	 * Store the new summary in a register, and save it
	 */
	const commitSummary = useCallback(() => {
		setDayTaskInfo(dayTaskInfo, { summary });
		fireCommand(Command.DATA_SAVE);
	}, [dayTaskInfo, summary]);

	return <Accordion
		key={dayName}
		class="day js-day"
		open={open}

		summaryClass="day__summary"
		summary={<>
			<TaskStatusComponent
				taskId={taskId}
				dayName={dayTaskInfo.dayName}
			/>
			<h3 class="day__heading">{dayTaskInfo.dayName}</h3>
			<InlineNote
				note={summary}
				onNoteChange={setSummary}
				saveChanges={commitSummary}
				editButtonTitle="Edit summary"
				placeholder="Summary"
			/>
		</>}
	>
		<div class="day__body">
			<DayTaskNote dayTask={dayTaskInfo} />
		</div>
	</Accordion>;
}
