import { h, type JSX } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import { memo } from 'preact/compat';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { getCurrentDate } from 'utils';
import { setDayTaskInfo } from 'data';
import {
	loadDayTaskForDayAndTask,
	SaveType,
	type Day as DBDay,
} from 'database';

import * as ui from 'ui';
import { formatDayName } from 'formatters/dayName';

import { Accordion, Button } from '../shared';
import { DayNote } from './DayNote';
import { DayTaskListForDay } from '../tasks/DayTaskList';

interface DayProps {
	day: DBDay;
	open?: boolean;
}

/**
 * Renders a day, including its notes and tasks, in a disclosure.
 */
export const Day = memo((props: DayProps): JSX.Element => {
	const {
		day,
		open,
	} = props;

	const isCurrentDay = useMemo(() => {
		const currentDate = getCurrentDate();
		return day.year === currentDate.year &&
			day.month === currentDate.month &&
			day.day === currentDate.day;
	}, [day]);

	const name = formatDayName(day);

	/**
	 * Ask for confirmation before deleting the current day.
	 */
	const removeDay = useCallback(async () => {
		if (!await ui.confirm('Are you sure?')) {
			return;
		}

		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.DAY_DELETE,
			id: day.id,
		}]);
	}, [day.id]);

	/**
	 * Prompt the user to select an existing task, and add it to the specified day.
	 */
	const addExistingTask = useCallback(async () => {
		const taskId = await ui.prompt('Task name', {
			type: ui.PromptType.TASK,
		});
		if (taskId === null) {
			return;
		}

		const dayTask = await loadDayTaskForDayAndTask({ day: day.id, task: taskId });

		if (dayTask) {
			ui.alert(`Task already exists on day ${name}`);
			return;
		}

		// TODO: Create new day task via save action
		setDayTaskInfo({ dayName: name, taskId }, {});
		fireCommand(Command.DATA_SAVE);
	}, [day.id, name]);

	return <Accordion
		class="day js-day"
		open={open}

		summaryClass="day__summary"
		summary={<h3 class="day__heading">{name}</h3>}
	>
		<div class="day__body">
			{!isCurrentDay &&
				<Button
					onClick={removeDay}
				>Remove day</Button>
			}

			<DayNote day={day} />

			<DayTaskListForDay
				dayId={day.id}
			/>

			<Button
				onClick={useCallback(
					() => fireCommand(Command.TASK_ADD_NEW, name),
					[name]
				)}
			>Add new task</Button>

			<Button
				onClick={useCallback(() => addExistingTask(), [addExistingTask])}
			>Add existing task</Button>
		</div>
	</Accordion>;
});
