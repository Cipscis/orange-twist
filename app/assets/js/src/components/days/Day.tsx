import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	type DayInfo,
	deleteDay,
	setDayInfo,
} from 'data';

import * as ui from 'ui';

import { Accordion, Button } from '../shared';
import { DayNote } from './DayNote';
import { TaskList } from '../tasks/TaskList';

interface DayProps {
	day: Readonly<DayInfo>;
	open?: boolean;
}

/**
 * Renders a day, including its notes and tasks, in a disclosure.
 */
export const Day = (props: DayProps): JSX.Element => {
	const {
		day,
		open,
	} = props;
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

			<TaskList
				matcher={tasks}
				dayName={name}
				onReorder={reorderTasks}
			/>

			<Button
				onClick={useCallback(
					() => fireCommand(Command.TASK_ADD_NEW, name),
					[name]
				)}
			>Add new task</Button>
		</div>
	</Accordion>;
};
