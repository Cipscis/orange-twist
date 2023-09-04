import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { forwardRef } from 'preact/compat';

import { Day } from '../types/Day.js';

import { deleteDay, setDayData } from '../registers/days/index.js';
import { Command, fireCommand } from '../registers/commands/index.js';

import { DayNote } from './DayNote.js';
import { TaskList } from './TaskList.js';

export interface DayProps {
	day: Readonly<Day>;
}

export const DayComponent = forwardRef(
	function DayComponent(
		props: DayProps,
		ref: React.ForwardedRef<HTMLDivElement>
	) {
		const { day } = props;
		const { dayName } = day;

		const removeDay = useCallback((dayName: string) => {
			if (!window.confirm('Are you sure?')) {
				return;
			}

			deleteDay(dayName);
		}, []);

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

		return <div
			class="day"
			ref={ref}
		>
			<h3 class="day__heading">${day.dayName}</h3>

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
		</div>;
	}
);
