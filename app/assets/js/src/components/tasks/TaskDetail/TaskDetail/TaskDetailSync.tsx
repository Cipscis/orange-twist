import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { isValidDateString } from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import {
	getDayNameParts,
	loadDayByDate,
	loadDayTaskForDayAndTask,
	SaveType,
	type Task,
} from 'database';

import * as ui from 'ui';

import {
	Button,
	Markdown,
} from 'components/shared';

import { DayTaskDetailListForTask } from '../../../tasks/DayTaskDetailList';
import { TaskNote } from '../TaskNote';

interface TaskDetailSyncProps {
	task: Task;
	setTask: (data: Partial<Task>) => Promise<void>;
}

/**
 * Renders a detailed view for a task, including its notes.
 */
export function TaskDetailSync(props: TaskDetailSyncProps): JSX.Element | null {
	const {
		task,
	} = props;

	/**
	 * Prompt the user for which day to add a day task for. If a day task exists on that day, show an error. Otherwise, construct a day if necessary and then construct a day task too.
	 */
	const addNewDayTask = useCallback(async () => {
		const dayName = await ui.prompt('What day?', { type: ui.PromptType.DATE });
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			ui.alert(`Invalid day ${dayName}`);
			return;
		}

		const [year, month, date] = getDayNameParts(dayName);

		// Do nothing if a day task already exists for this day
		const day = await loadDayByDate({ year, month, day: date });
		if (day) {
			const dayTask = await loadDayTaskForDayAndTask({ day: day.id, task: task.id });
			if (dayTask) {
				ui.alert(`Day ${dayName} already exists`);
				return;
			}
		}

		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.TASK_STATUS_FOR_DATE,
			id: task.id,
			status: 1, // Use default status
			day: { year, month, day: date },
		}]);
	}, [task.id]);

	return <section class="orange-twist__section">
		<Markdown
			content={`## ${task.name}`}
			inline
		/>
		<TaskNote taskId={task.id} />
		<DayTaskDetailListForTask taskId={task.id} />

		<Button
			onClick={addNewDayTask}
		>Add day</Button>
	</section>;
}
