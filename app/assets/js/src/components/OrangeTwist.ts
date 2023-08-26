import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import htm from 'htm';

import classNames from 'classnames';

import { isValidDateString } from '../util/isValidDateString.js';

import { DayComponent, DayProps as DayComponentProps } from './DayComponent.js';

import { saveDays, setDayData, useDays } from '../registers/days/index.js';
import { addNewTask, saveTasks, useTasks } from '../registers/tasks/index.js';
import { TaskComponent, TaskComponentProps } from './TaskComponent.js';

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

					<button type="button" onClick="${addNewDay}">Add day</button>
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
					<button type="button" onClick="${() => addNewTask()}">Add new task</button>
					<ul>
					${tasks.map(
						(task) => {
							const taskProps: TaskComponentProps = { task };

							return html`<li key="${task.id}"><${TaskComponent} ...${taskProps} /></li>`;
						}
					)}
				</ul>`
			}

			${
				!isLoading &&
				html`<button type="button" onClick="${() => {
					saveDays();
					saveTasks();
				}}">Save data</button>`
			}
		</section>
	</div>`;
}
