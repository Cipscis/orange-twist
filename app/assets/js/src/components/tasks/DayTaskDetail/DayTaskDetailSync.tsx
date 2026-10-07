import {
	h,
	Fragment,
	type JSX,
} from 'preact';
import { useCallback } from 'preact/hooks';

import { SaveType, type DayTask } from 'database';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { Accordion, InlineNote } from 'components/shared';
import { DayName } from '../../days/DayName';
import { SettableDayTaskNoteSync } from '../TaskDetail/SettableDayTaskNote';
import { DayTaskStatusPickerSync } from '../DayTaskStatusPicker';

export interface DayTaskDetailSyncProps {
	dayTask: DayTask;
	setDayTask: (data: Partial<DayTask>) => Promise<void>;
	open?: boolean;
}

/**
 * Renders a detailed view of a day task. Allows its status, summary, and note to be edited.
 */
export function DayTaskDetailSync(props: DayTaskDetailSyncProps): JSX.Element {
	const {
		dayTask,
		setDayTask,
		open,
	} = props;

	const commitSummary = useCallback((summary: string) => {
		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.DAY_TASK,
			id: dayTask.id,
			dayTask: { summary },
		}]);
	}, [dayTask.id]);

	return <Accordion
		class="day js-day"
		open={open}

		summaryClass="day__summary"
		summary={<>
			<DayTaskStatusPickerSync
				dayTask={dayTask}
				setDayTask={setDayTask}
			/>
			<h3 class="day__heading">
				<DayName day={dayTask.day} />
			</h3>
			<InlineNote
				note={dayTask.summary}
				onNoteChange={commitSummary}
				editButtonTitle="Edit summary"
				placeholder="Summary"
			/>
		</>}
	>
		<div class="day__body">
			<SettableDayTaskNoteSync
				dayTask={dayTask}
				setDayTask={setDayTask}
			/>
		</div>
	</Accordion>;
}
