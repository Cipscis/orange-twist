import { h, type JSX } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import { memo } from 'preact/compat';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { getCurrentDate } from 'utils';
import {
	loadDayTaskForDayAndTask,
	SaveType,
	type Day,
} from 'database';

import * as ui from 'ui';
import { formatDayName } from 'formatters/dayName';

import { Accordion, Button } from '../../shared';
import { DayTaskListForDay } from '../../tasks/DayTaskList';
import { DayNoteSync } from '../DayNote';

export interface DaySyncProps {
	day: Day;
	setDay: (data: Partial<Day>) => Promise<void>;
	open?: boolean;
}

/**
 * Renders a day, including its notes and tasks, in a disclosure.
 */
export const DaySync = memo((props: DaySyncProps): JSX.Element => {
	const {
		day,
		setDay,
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

		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.DAY_TASK_ADD,
			dayTask: {
				day: day.id,
				task: taskId,
			},
		}]);
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

			<DayNoteSync
				day={day}
				setDay={setDay}
			/>

			<DayTaskListForDay
				dayId={day.id}
			/>

			<Button
				onClick={useCallback(
					() => fireCommand(Command.TASK_ADD_NEW, day.id),
					[day.id]
				)}
			>Add new task</Button>

			<Button
				onClick={addExistingTask}
			>Add existing task</Button>
		</div>
	</Accordion>;
});
