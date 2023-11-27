import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	type DayInfo,
	deleteDay,
	setDayInfo,
} from 'data';

import { DayNote } from './DayNote';
import { TaskList } from './TaskList';

interface DayProps extends h.JSX.HTMLAttributes<HTMLDetailsElement> {
	day: Readonly<DayInfo>;
}

/**
 * Renders a day, including its notes and tasks, in a disclosure.
 *
 * Props that can apply to a `<details>` element will be passed
 * through to that element.
 */
export const Day = (props: DayProps): JSX.Element => {
	const {
		day,
		...passthroughProps
	} = props;
	const {
		name,
		tasks,
	} = day;

	/**
	 * Ask for confirmation before deleting the current day.
	 */
	const removeDay = useCallback(() => {
		if (!window.confirm('Are you sure?')) {
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

	return <details
		class="day"
		{...passthroughProps}
	>
		<summary class="day__summary">
			<h3 class="day__heading">{name}</h3>
		</summary>

		<div class="day__body">
			<button
				type="button"
				class="button"
				onClick={removeDay}
			>Remove day</button>

			<DayNote day={day} />

			<TaskList
				matcher={tasks}
				dayName={name}
				onReorder={reorderTasks}
			/>

			<button
				type="button"
				class="button"
				onClick={useCallback(
					() => fireCommand(Command.TASK_ADD_NEW, name),
					[name]
				)}
			>Add new task</button>
		</div>
	</details>;
};
