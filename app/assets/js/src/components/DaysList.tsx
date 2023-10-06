import { h } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import classNames from 'classnames';

import { isValidDateString } from '../util/index.js';

import { TaskStatus } from '../types/TaskStatus.js';

import { setDayData, useDays } from '../registers/days/index.js';
import { addNewTask } from '../registers/tasks/index.js';
import { Command, useCommand } from '../registers/commands/index.js';

import { DayComponent } from './DayComponent.js';

/**
 * Renders a list of days.
 *
 * Only one of these components is intended to render at a time.
 */
export function DayList() {
	const {
		data: days,
		isLoading,
		error,
	} = useDays();

	// Scroll to new day when created
	const daySectionsRef = useRef<Record<string, HTMLElement | null>>({});
	const [newDayName, setNewDayName] = useState<string | null>(null);
	useEffect(() => {
		if (newDayName) {
			const newDaySection = daySectionsRef.current[newDayName];
			if (newDaySection) {
				newDaySection.scrollIntoView();
			}
		}
	}, [newDayName]);

	// Scroll to last day when days loads
	const scrolledToLastDay = useRef(false);
	useEffect(() => {
		if (scrolledToLastDay.current) {
			return;
		}

		if (days) {
			const lastDay = Object.values(daySectionsRef.current).at(-1);
			lastDay?.scrollIntoView({ behavior: 'instant' });
			scrolledToLastDay.current = true;
		}
	}, [days]);

	// TODO: Move this to `OrangeTwist` and find another way to hook this up
	/**
	 * Ask the user what day to add, then add it to the register.
	 */
	const addNewDay = useCallback((dayNameArg?: string) => {
		if (!days) {
			return;
		}

		const dayName = dayNameArg ?? window.prompt('What day?');
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
		setNewDayName(dayName);
	}, [days]);

	useCommand(Command.DAY_ADD_NEW, addNewDay);

	const [newTasksCreated, setNewTasksCreated] = useState(0);
	const [newTaskCreatedDayName, setNewTaskCreatedDayName] = useState<string | null>(null);

	// After the initial load, focus on the last task each time a new one is created.
	useEffect(() => {
		if (newTasksCreated  === 0) {
			return;
		}

		const taskListWrapper = (() => {
			if (newTaskCreatedDayName === null) {
				return null;
			}

			return daySectionsRef.current?.[newTaskCreatedDayName];
		})();

		if (!taskListWrapper) {
			return;
		}

		// Find new task and put it in edit mode, then scroll to it

		// TODO: Is this the best way to find the right element?
		const taskEditButtons = Array.from(taskListWrapper.querySelectorAll<HTMLElement>('.js-task__name-edit') ?? []);
		const lastTaskEditButton = taskEditButtons.at(-1);

		lastTaskEditButton?.click();
		lastTaskEditButton?.scrollIntoView({
			block: 'center',
			behavior: 'smooth',
		});
	}, [newTasksCreated, newTaskCreatedDayName]);

	// TODO: Move this to `OrangeTwist` and find another way to hook this up.
	/**
	 * Create a new task against a particular day,
	 * and then scroll to it immediately.
	 *
	 * @param [dayName] If this parameter is not received,
	 * no task will be created.
	 */
	const addNewTaskWithDayName = useCallback((dayName?: string) => {
		if (!dayName) {
			return;
		}

		const newTaskId = addNewTask({ dayName });
		setDayData(dayName, {
			tasks: [{
				id: newTaskId,
				status: TaskStatus.TODO,
				note: null,
			}],
		});
		setNewTasksCreated((oldValue) => oldValue + 1);
		setNewTaskCreatedDayName(dayName ?? null);
	}, []);
	useCommand(Command.TASK_ADD_NEW, addNewTaskWithDayName);

	return <section
		class={classNames({
			'orange-twist__section': true,
			'orange-twist__section--loading': isLoading,
		})}
		aria-busy={isLoading || undefined}
	>
		<h2 class="orange-twist__title">Days</h2>

		{
			isLoading &&
			<span class="orange-twist__loader" title="Loading" />
		}
		{
			error &&
			// TODO: Handle error better somehow
			<span class="orange-twist__error">Error: {error}</span>
		}
		{
			days && <>
				{days.map((day, i) => (
					<DayComponent
						key={day.dayName}
						ref={(ref: HTMLDetailsElement | null) => daySectionsRef.current[day.dayName] = ref}
						day={day}
						open={i === days.length-1}
					/>
				))}

				<button
					type="button"
					class="button"
					onClick={() => addNewDay()}
				>Add day</button>
			</>
		}
	</section>;
}
