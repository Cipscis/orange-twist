import { h } from 'preact';
import htm from 'htm';

import { Task } from '../types/Task.js';
import { TaskStatus } from '../types/TaskStatus.js';
import { useCallback, useContext, useEffect, useRef, useState } from 'preact/hooks';
import { setTaskData } from '../registers/tasks/tasksRegister.js';
import { elementHasAncestor } from '../util/elementHasAncestor.js';
import { OrangeTwistContext } from './OrangeTwist.js';

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

	const statusSymbol = taskStatusSymbols[status];

	const [isInChangeMode, setIsInChangeMode] = useState(false);
	const changeStatus = useCallback((newStatus: TaskStatus) => {
		setTaskData(id, { status: newStatus }, { dayName });
		setIsInChangeMode(false);
		api.save();
	}, []);

	const rootRef = useRef<HTMLElement>(null);

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
					<ul class="task-status__options">
						${Object.values(TaskStatus).map((taskStatus) => html`
							<li
								key="${taskStatus}"
								class="task-status__option"
							>
								<button
									type="button"
									class="task-status__option-button"
									onClick="${() => changeStatus(taskStatus)}"
								>
									${taskStatusSymbols[taskStatus]}
								</button>
							</li>
						`)}
					</ul>
				`
			}
		</span>
	`;
}
