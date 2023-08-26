import { h } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';
import htm from 'htm';

import classNames from 'classnames';

import { isValidDateString } from '../util/isValidDateString.js';

import { DayComponent, DayProps as DayComponentProps } from './DayComponent.js';

import { saveDays, setDayData, useDays } from '../registers/days/index.js';
import { addNewTask, saveTasks, useTasks } from '../registers/tasks/index.js';
import { TaskComponent, TaskComponentProps } from './TaskComponent.js';
import { toast } from './Toast.js';
import { TaskStatus } from '../types/TaskStatus.js';

// Initialise htm with Preact
const html = htm.bind(h);

export function OrangeTwist() {
	const {
		data: days,
		isLoading: isDaysLoading,
		error: daysError,
	} = useDays();

	const {
		data: tasks,
		isLoading: isTasksLoading,
		error: tasksError,
	} = useTasks();

	const unfinishedTasksListRef = useRef<HTMLElement>(null);

	const addNewDay = useCallback(() => {
		if (!days) {
			return;
		}

		const dayName = window.prompt('What day?');
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			window.alert('Invalid day');
			return;
		}

		const existingDayData = days.find((day) => day.dayName === dayName);
		if (existingDayData) {
			window.alert('Day already exists');
			return;
		}

		setDayData(dayName, {});
	}, [days]);

	const [newTasksCreated, setNewTasksCreated] = useState(0);
	const focusOnLastUnfinishedTask = useCallback(() => {
		// TODO: Is this the best way to find the right element to focus on?
		const taskInputs = Array.from(unfinishedTasksListRef.current?.querySelectorAll('input') ?? []);
		const lastTaskInput = taskInputs.at(-1);
		lastTaskInput?.focus();
	}, []);

	// After the initial load, focus on the last task each time a new one is created.
	useEffect(() => {
		if (newTasksCreated > 0) {
			focusOnLastUnfinishedTask();
		}
	}, [newTasksCreated]);

	const addNewTaskUI = useCallback(() => {
		addNewTask();
		setNewTasksCreated((oldValue) => oldValue + 1);
	}, []);

	/**
	 * How many minutes should pass between each autosave.
	 */	const autosaveMinutes = 1;
	const autosaveTimeout = useRef<number | null>(null);

	/**
	 * Start a timeout to automatically save.
	 */
	const queueAutosave = useCallback(() => {
		if (autosaveTimeout.current !== null) {
			window.clearTimeout(autosaveTimeout.current);
		}

		autosaveTimeout.current = window.setInterval(() => {
			saveData();
		}, autosaveMinutes * 1000 * 60);
	}, []);

	const saveData = useCallback(() => {
		saveDays();
		saveTasks();
		toast('Saved', 2000);

		// Reset autosave timeout
		if (autosaveTimeout.current !== null) {
			window.clearTimeout(autosaveTimeout.current);
		}
		queueAutosave();
	}, []);

	/**
	 * Queue autosave on initial render
	 */
	useEffect(() => {
		queueAutosave();

		return () => {
			if (autosaveTimeout.current !== null) {
				window.clearInterval(autosaveTimeout.current);
			}
		};
	}, [saveData]);

	const isLoading = isDaysLoading || isTasksLoading;

	return html`<div class="orange-twist">
		<section
			class="${classNames({
				'orange-twist__section': true,
				'orange-twist__section--loading': isDaysLoading,
			})}"
			aria-busy="${isDaysLoading || null}"
		>
			<h2 class="orange-twist__title">Days</h2>

			${
				isDaysLoading &&
				html`<span class="orange-twist__loader" title="Loading"></span>`
			}
			${
				daysError &&
				// TODO: Handle error better somehow
				html`<span class="orange-twist__error">Error: ${daysError}</span>`
			}
			${
				days &&
				html`
					${days.map((day) => {
						const dayProps: DayComponentProps = { day };
						return html`
							<${DayComponent}
								key="${day.dayName}"
								...${dayProps}
							/>
						`;
					})}

					<button
						type="button"
						class="button"
						onClick="${addNewDay}"
					>Add day</button>
				`
			}
		</section>

		<section
			class="${classNames({
				'orange-twist__section': true,
				'orange-twist__section--loading': isTasksLoading,
			})}"
			aria-busy="${isTasksLoading || null}"
		>
			<h2 class="orange-twist__title">Tasks</h2>

			${
				isTasksLoading &&
				html`<span class="orange-twist__loader" title="Tasks loading"></span>`
			}
			${
				tasksError &&
				html`<span class="orange-twist__error">Tasks loading error: ${tasksError}</span>`
			}
			${
				tasks &&

				html`
					<!-- TODO: Reduce duplication -->
					<ul
						class="orange-twist__task-list"
						ref="${unfinishedTasksListRef}"
					>
						${tasks.map(
							(task) => {
								const taskProps: TaskComponentProps = { task };

								if (task.status === TaskStatus.COMPLETED) {
									return '';
								}

								return html`<li
									key="${task.id}"
								><${TaskComponent} ...${taskProps} /></li>`;
							}
						)}
					</ul>

					<button
						type="button"
						class="button"
						onClick="${addNewTaskUI}"
					>Add new task</button>
				`
			}
		</section>

		${
			tasks &&

			html`
				<details class="orange-twist__section">
					<summary>
						<h2 class="orange-twist__title">Completed tasks</h2>
					</summary>

					<ul class="orange-twist__task-list">
						${tasks.map(
							(task) => {
								const taskProps: TaskComponentProps = { task };

								if (task.status !== TaskStatus.COMPLETED) {
									return '';
								}

								return html`<li
									key="${task.id}"
								><${TaskComponent} ...${taskProps} /></li>`;
							}
						)}
					</ul>
				</details>
			`
		}

		${
			!isLoading &&
			html`<button
				type="button"
				class="button"
				onClick="${saveData}"
			>Save data</button>`
		}
	</div>`;
}
