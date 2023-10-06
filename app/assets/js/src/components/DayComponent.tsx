import { h } from 'preact';
import { useCallback, useId } from 'preact/hooks';
import { forwardRef } from 'preact/compat';

import { Day } from '../types/Day.js';

import { deleteDay, setDayData } from '../registers/days/index.js';
import { Command, fireCommand } from '../registers/commands/index.js';

import { DayNote } from './DayNote.js';
import { TaskList } from './TaskList.js';

interface DayProps extends h.JSX.HTMLAttributes<HTMLDetailsElement> {
	day: Readonly<Day>;
}

/**
 * Renders a day, including its notes and tasks, in a disclosure.
 *
 * Props that can apply to a `<details>` element will be passed
 * through to that element.
 */
export const DayComponent = forwardRef(
	function DayComponent(
		props: DayProps,
		ref: React.ForwardedRef<HTMLDetailsElement>
	) {
		const {
			day,
			...passthrougProps
		} = props;
		const { dayName } = day;

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

			const newTasks: Day['tasks'] = [];
			for (const task of day.tasks) {
				const newIndex = newTaskIndexById[task.id];
				newTasks[newIndex] = task;
			}

			setDayData(day.dayName, {
				tasks: newTasks,
			}, {
				overwriteTasks: true,
			});
			fireCommand(Command.DATA_SAVE);
		}, [day.tasks, day.dayName]);

		const id = useId();

		return <details
			class="day"
			ref={ref}
			{...passthrougProps}
		>
			<summary class="day__summary" style={`view-transition-name: ${id};`}>
				<h3 class="day__heading">{day.dayName}</h3>
			</summary>

			<div class="day__body">
				<button
					type="button"
					class="button"
					onClick={() => removeDay(dayName)}
				>Remove day</button>

				<div class="day__note">
					<DayNote day={day} />
				</div>

				{
					day.tasks.length > 0 &&
					<TaskList
						tasks={day.tasks}
						dayName={day.dayName}
						onReorder={reorderTasks}
					/>
				}

				<button
					type="button"
					class="button"
					onClick={() => fireCommand(Command.TASK_ADD_NEW, dayName)}
				>Add new task</button>
			</div>
		</details>;
	}
);
