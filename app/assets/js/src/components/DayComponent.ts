import { h } from 'preact';
import { useCallback, useContext } from 'preact/hooks';
import { forwardRef } from 'preact/compat';

import htm from 'htm';

import { Day } from '../types/Day.js';

import { deleteDay, setDayData } from '../registers/days/index.js';
import { fireCommand } from '../registers/commands/commandsRegister.js';

import { OrangeTwistContext } from './OrangeTwist.js';

import { DayNote, DayNoteProps } from './DayNote.js';
import { TaskList } from './TaskList.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface DayProps {
	day: Readonly<Day>;
}

export const DayComponent = forwardRef(function DayComponent(props: DayProps, ref: React.ForwardedRef<HTMLElement>) {
	const { day } = props;
	const { dayName } = day;

	const api = useContext(OrangeTwistContext);

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
		api.save();
	}, [day.tasks, day.dayName, api]);

	const dayNoteProps: DayNoteProps = { day };

	return html`
		<div
			class="day"
			ref="${ref}"
		>
			<h3 class="day__heading">${day.dayName}</h3>

			<button
				type="button"
				class="button"
				onClick="${() => removeDay(dayName)}"
			>Remove day</button>

			<div class="day__note">
				<${DayNote} ...${dayNoteProps} />
			</div>

			${
				day.tasks.length > 0 &&
				html`<${TaskList}
					tasks="${day.tasks}"
					dayName="${day.dayName}"
					onReorder="${reorderTasks}"
				/>`
			}

			<button
				type="button"
				class="button"
				onClick="${() => fireCommand('add-new-task', dayName)}"
			>Add new task</button>
		</div>
	`;
});
