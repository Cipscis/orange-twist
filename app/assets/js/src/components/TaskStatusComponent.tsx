import { h, type JSX } from 'preact';

import type { TaskInfo } from 'registers/tasks';
import { TaskStatus } from 'types/TaskStatus';

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { Command } from 'types/Command';

import {
	animate,
	nodeHasAncestor,
	CSSKeyframes,
} from 'util/index';

import { deleteTask, setTaskInfo } from 'registers/tasks';
import { fireCommand } from 'registers/commands';
import { getDayInfo, setDayInfo } from 'registers/days';

interface TaskStatusComponentProps {
	task: TaskInfo;
	dayName?: string;
	/** @default false */
	readonly?: boolean;
}

const taskStatusSymbols = {
	[TaskStatus.TODO]: '☐',
	[TaskStatus.IN_PROGRESS]: '▶️',
	[TaskStatus.COMPLETED]: '☑️',

	[TaskStatus.INVESTIGATING]: '🔍',
	[TaskStatus.IN_REVIEW]: '👀',
	[TaskStatus.READY_TO_TEST]: '🧪',
	[TaskStatus.APPROVED_TO_DEPLOY]: '🟢',
	[TaskStatus.WILL_NOT_DO]: '🚫',
} as const satisfies Record<TaskStatus, string>;

/**
 * Renders the status for a specified task, optionally
 * for a specified day.
 *
 * Allows that status to be edited.
 */
export function TaskStatusComponent(props: TaskStatusComponentProps): JSX.Element {
	const {
		task,
		dayName,
	} = props;
	const { id } = task;

	const readonly = props.readonly ?? false;

	const rootRef = useRef<HTMLElement>(null);
	const optionsRef = useRef<HTMLUListElement>(null);

	const status = (() => {
		if (dayName) {
			const dayData = getDayInfo(dayName);
			const dayTasks = dayData?.tasks;

			const taskOnDay = dayTasks?.find(({ id: taskId }) => taskId === id);
			if (taskOnDay) {
				return taskOnDay.status;
			}
		}

		return task.status;
	})();

	const statusSymbol = taskStatusSymbols[status];

	const [isInChangeMode, setIsInChangeModeInternal] = useState(false);

	/**
	 * Modify change mode with an exit animation
	 */
	const setIsInChangeMode = useCallback(async (value: boolean) => {
		if (value || !optionsRef.current) {
			setIsInChangeModeInternal(value);
			return;
		}

		// If we're leaving change mode and the options are visible, animate them out
		const animation = await animate(optionsRef.current, CSSKeyframes.DISAPPEAR_SCREEN);
		if (animation) {
			await animation.finished;
		}
		setIsInChangeModeInternal(value);
	}, [setIsInChangeModeInternal]);

	/**
	 * Update task data to reflect new status
	 */
	const changeStatus = useCallback((newStatus: TaskStatus) => {
		setTaskInfo(id, { status: newStatus }, { dayName });
		setIsInChangeMode(false);
		fireCommand(Command.DATA_SAVE);
	}, [dayName, id, setIsInChangeMode]);

	/**
	 * Ask for confirmation, then delete the task
	 */
	const deleteTaskUI = useCallback(() => {
		if (!confirm('Are you sure you want to delete this task?')) {
			return;
		}

		deleteTask(id);
		setIsInChangeMode(false);
		fireCommand(Command.DATA_SAVE);
	}, [id, setIsInChangeMode]);

	/**
	 * Ask for confirmation, then remove a task from this component's day.
	 */
	const removeTaskFromDay = useCallback(() => {
		if (!confirm(`Are you sure you want to remove this task from ${dayName}?`)) {
			return;
		}

		if (!dayName) {
			return;
		}

		const day = getDayInfo(dayName);
		if (!day) {
			return;
		}

		const tasks = structuredClone(day.tasks);
		const thisTaskIndex = tasks.findIndex((dayTask) => dayTask.id === id);
		if (thisTaskIndex === -1) {
			return;
		}

		tasks.splice(thisTaskIndex, 1);
		setDayInfo(dayName, { tasks }, { overwriteTasks: true });
	}, [dayName, id]);

	/**
	 * Remove the task from the current day, if there is one,
	 * otherwise delete it entirely.
	 */
	const onDeleteButtonClick = useCallback(() => {
		if (dayName) {
			removeTaskFromDay();
		} else {
			deleteTaskUI();
		}
	}, [dayName, removeTaskFromDay, deleteTaskUI]);

	// TODO: Turn the selector part into a custom element, using shadow DOM

	/**
	 * Detect if a keypress was "Escape". If it was, exit change mode.
	 */
	const exitChangeModeOnEscape = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsInChangeMode(false);
		}
	}, [setIsInChangeMode]);

	/**
	 * Detect if a click was outside the component. If it was, exit change mode.
	 */
	const exitChangeModeOnOutsideClick = useCallback((e: MouseEvent) => {
		if (
			rootRef.current &&
			e.target instanceof Element
		) {
			if (!nodeHasAncestor(e.target, rootRef.current)) {
				setIsInChangeMode(false);
			}
		}
	}, [setIsInChangeMode]);

	// Set up event listeners for exiting change mode.
	useEffect(() => {
		const eventListenerAbortController = new AbortController();
		const { signal } = eventListenerAbortController;

		if (isInChangeMode) {
			document.addEventListener('keydown', exitChangeModeOnEscape, { signal });
			document.addEventListener('click', exitChangeModeOnOutsideClick, { signal });
		}

		return () => {
			eventListenerAbortController.abort();
		};
	}, [isInChangeMode, exitChangeModeOnEscape, exitChangeModeOnOutsideClick]);

	return <span
		class="task-status"
		ref={rootRef}
	>
		{readonly
			? <span
				class="task-status__indicator task-status__indicator--readonly"
				title={status}
			>{statusSymbol}</span>
			: <button
				type="button"
				class="task-status__indicator"
				title={status}
				onClick={() => setIsInChangeMode(!isInChangeMode)}
			>{statusSymbol}</button>
		}

		{
			isInChangeMode &&
			<ul
				class="task-status__options"
				ref={optionsRef}
			>
				<li class="task-status__optgroup">
					<ul class="task-status__optgroup-list">
						{Object.values(TaskStatus).map((taskStatus) => (
							<li
								key={taskStatus}
								class="task-status__option"
							>
								<button
									type="button"
									class="task-status__option-button"
									title={taskStatus}
									onClick={() => changeStatus(taskStatus)}
								>
									{taskStatusSymbols[taskStatus]}
								</button>
							</li>
						))}
					</ul>
				</li>

				<li class="task-status__option">
					<button
						type="button"
						class="task-status__option-button"
						title="Delete"
						onClick={onDeleteButtonClick}
					>❌</button>
				</li>
			</ul>
		}
	</span>;
}
