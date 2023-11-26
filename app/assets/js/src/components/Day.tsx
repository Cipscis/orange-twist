import { h } from 'preact';
import { useCallback, useEffect, useId, useRef } from 'preact/hooks';
import React, { forwardRef } from 'preact/compat';

import type { DayInfo } from 'data/days';

import { getTaskInfo } from 'data/tasks';
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

		const tasksRef = useRef<HTMLDivElement | null>();

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

		/**
		 * An array of the day's task IDs, used to compare
		 * between renders.
		 */
		const taskIdsRef = useRef<ReadonlyArray<number> | null>(null);

		// Scroll to new task when created, and focus on its name
		useEffect(() => {
			const taskIds = tasks.map((id) => id);
			const previousTaskIds = taskIdsRef.current;

			const diff = previousTaskIds &&
				taskIds.filter(
					(taskId) => !previousTaskIds.includes(taskId)
				);

			// If one new task was added, begin editing its name
			if (diff?.length === 1 && getTaskInfo(diff[0])?.name === '') {
				if (tasksRef.current) {
					// TODO: Is this the best way to find the right element?
					const taskEditButtons = Array.from(
						tasksRef.current.querySelectorAll<HTMLElement>('.js-task__name-edit') ?? []
					);
					const lastTaskEditButton = taskEditButtons.at(-1);

					if (lastTaskEditButton) {
						// First, ensure any sections it's in are open
						const ancestralDetails: Array<HTMLDetailsElement> = [];
						let cursor: HTMLElement | null = lastTaskEditButton;
						while (cursor !== null) {
							cursor = cursor.parentElement;
							if (cursor instanceof HTMLDetailsElement) {
								ancestralDetails.push(cursor);
							}
						}
						for (const el of ancestralDetails) {
							el.toggleAttribute('open', true);
						}

						// Then, click the edit button
						lastTaskEditButton.click();
					}
				}
			}

			taskIdsRef.current = taskIds;
		}, [tasks]);

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
					taskIds={tasks}
					dayName={name}
					onReorder={reorderTasks}
					ref={(ref: HTMLDivElement | null) => tasksRef.current = ref}
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
