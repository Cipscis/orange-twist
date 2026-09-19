import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';
import { memo } from 'preact/compat';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	deleteDay,
	setDayInfo,
	setDayTaskInfo,
	useDayInfo,
} from 'data';

import * as ui from 'ui';

import { Accordion, Button } from '../shared';
import { DayNote } from './DayNote';
import { DayTaskList } from '../tasks/DayTaskList';

interface DayProps {
	dayName: string;
	open?: boolean;
}

/**
 * Renders a day, including its notes and tasks, in a disclosure.
 */
export const Day = memo((props: DayProps): JSX.Element => {
	const {
		dayName,
		open,
	} = props;

	// TODO: Remove this fallback once we read from the database
	const day = useDayInfo(dayName) ?? {
		name: dayName,
		note: '',
		tasks: [],
	};

	const {
		name,
		tasks,
	} = day;

	/**
	 * Ask for confirmation before deleting the current day.
	 */
	const removeDay = useCallback(async () => {
		if (!await ui.confirm('Are you sure?')) {
			return;
		}

		deleteDay(name);
	}, [name]);

	/**
	 * Update the saved order of this day's tasks.
	 */
	const reorderTasks = useCallback((tasks: readonly number[]) => {
		setDayInfo(name, { tasks });
		fireCommand(Command.DATA_SAVE);
	}, [name]);

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

		if (tasks.includes(taskId)) {
			ui.alert(`Task already exists on day ${name}`);
			return;
		}

		setDayTaskInfo({ dayName: name, taskId }, {});
		fireCommand(Command.DATA_SAVE);
	}, [tasks, name]);

	return <Accordion
		class="day js-day"
		open={open}

		summaryClass="day__summary"
		summary={<h3 class="day__heading">{name}</h3>}
	>
		<div class="day__body">
			<Button
				onClick={removeDay}
			>Remove day</Button>

			<DayNote day={day} />

			<DayTaskList
				taskIds={tasks}
				dayName={name}
				onReorder={reorderTasks}
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
