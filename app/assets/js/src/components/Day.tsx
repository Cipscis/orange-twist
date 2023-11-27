import { h } from 'preact';
import {
	useCallback,
	useId,
} from 'preact/hooks';
import React, { forwardRef } from 'preact/compat';

import type { DayInfo } from 'data/days';

import { deleteDay, setDayInfo } from 'data/days';

import { Command } from 'types/Command';

import { fireCommand } from 'registers/commands';

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
export const Day = forwardRef(
	function Day(
		props: DayProps,
		ref: React.ForwardedRef<HTMLDetailsElement>
	) {
		const {
			day,
			...passthroughProps
		} = props;
		const {
			name,
			tasks,
		} = day;

		const id = useId();

		/**
		 * Ask for confirmation before deleting the current day.
		 */
		const removeDay = useCallback((dayName: string) => {
			if (!window.confirm('Are you sure?')) {
				return;
			}

			deleteDay(dayName);
		}, []);

		/**
		 * Update the saved order of this day's tasks.
		 */
		const reorderTasks = useCallback((taskIds: number[]) => {
			const newTaskIndexById = Object.fromEntries(taskIds.map((id, index) => [id, index]));

			const newTasks: DayInfo['tasks'] = [];
			for (const taskId of tasks) {
				const newIndex = newTaskIndexById[taskId];
				newTasks[newIndex] = taskId;
			}

			setDayInfo(name, {
				tasks: newTasks,
			});
			fireCommand(Command.DATA_SAVE);
		}, [tasks, name]);

		return <details
			class="day"
			ref={ref}
			{...passthroughProps}
		>
			<summary class="day__summary" style={`view-transition-name: ${id};`}>
				<h3 class="day__heading">{name}</h3>
			</summary>

			<div class="day__body">
				<button
					type="button"
					class="button"
					onClick={() => removeDay(name)}
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
					onClick={() => fireCommand(Command.TASK_ADD_NEW, name)}
				>Add new task</button>
			</div>
		</details>;
	}
);
