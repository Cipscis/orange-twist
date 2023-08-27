import { h } from 'preact';
import htm from 'htm';

import { Task } from '../types/Task.js';
import { TaskStatus } from '../types/TaskStatus.js';
import { useCallback, useContext, useEffect, useRef, useState } from 'preact/hooks';
import { deleteTask, setTaskData } from '../registers/tasks/tasksRegister.js';
import { elementHasAncestor } from '../util/elementHasAncestor.js';
import { OrangeTwistContext } from './OrangeTwist.js';
import { animate } from '../util/animate.js';
import { CSSKeyframes } from '../util/CSSKeyframes.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface TaskStatusComponentProps {
	task: Task;
	dayName?: string;
}

const taskStatusSymbols = {
	[TaskStatus.TODO]: '☐',
	[TaskStatus.IN_PROGRESS]: '▶️',
	[TaskStatus.COMPLETED]: '☑️',
} as const satisfies Record<TaskStatus, string>;

export function TaskStatusComponent(props: TaskStatusComponentProps) {
	const {
		task: {
			id,
			status,
		},
		dayName,
	} = props;

	const api = useContext(OrangeTwistContext);

	const rootRef = useRef<HTMLElement>(null);
	const optionsRef = useRef<HTMLElement>(null);

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
		setTaskData(id, { status: newStatus }, { dayName });
		setIsInChangeMode(false);
		api.save();
	}, []);

	/**
	 * Ask for confirmation, then delete the task
	 */
	const deleteTaskUI = useCallback(() => {
		if (!confirm('Are you sure you want to delete this task?')) {
			return;
		}

		deleteTask(id);
		setIsInChangeMode(false);
		api.save();
	}, []);

	// TODO: Turn the selector part into a custom element, using shadow DOM

	/**
	 * Detect if a keypress was "Escape". If it was, exit change mode.
	 */
	const exitChangeModeOnEscape = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsInChangeMode(false);
		}
	}, []);

	/**
	 * Detect if a click was outside the component. If it was, exit change mode.
	 */
	const exitChangeModeOnOutsideClick = useCallback((e: MouseEvent) => {
		if (
			rootRef.current &&
			e.target instanceof Element
		) {
			if (!elementHasAncestor(e.target, rootRef.current)) {
				setIsInChangeMode(false);
			}
		}
	}, []);

	// Set up event listeners for exiting change mode.
	useEffect(() => {
		if (isInChangeMode) {
			document.addEventListener('keydown', exitChangeModeOnEscape);
			document.addEventListener('click', exitChangeModeOnOutsideClick);
		}

		return () => {
			document.removeEventListener('keydown', exitChangeModeOnEscape);
			document.removeEventListener('click', exitChangeModeOnOutsideClick);
		};
	}, [isInChangeMode]);

	return html`
		<span
			class="task-status"
			ref="${rootRef}"
		>
			<button
				type="button"
				class="task-status__change"
				title="${status}"
				onClick="${() => setIsInChangeMode(!isInChangeMode)}"
			>${statusSymbol}</button>

			${
				isInChangeMode &&
				html`
					<ul
						class="task-status__options"
						ref="${optionsRef}"
					>
						<li class="task-status__optgroup">
							<ul class="task-status__optgroup-list">
								${Object.values(TaskStatus).map((taskStatus) => html`
									<li
										key="${taskStatus}"
										class="task-status__option"
									>
										<button
											type="button"
											class="task-status__option-button"
											title="${taskStatus}"
											onClick="${() => changeStatus(taskStatus)}"
										>
											${taskStatusSymbols[taskStatus]}
										</button>
									</li>
								`)}
							</ul>
						</li>

						<li class="task-status__option">
							<button
								type="button"
								class="task-status__option-button"
								title="Delete"
								onClick="${() => deleteTaskUI()}"
							>❌</button>
						</li>
					</ul>
				`
			}
		</span>
	`;
}
