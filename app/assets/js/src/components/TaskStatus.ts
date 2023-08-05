import { h } from 'preact';
import htm from 'htm';

import { Task } from '../types/Task.js';
import { TaskStatus } from '../types/TaskStatus.js';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { setTaskData } from '../registers/tasks/tasksRegister.js';

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

	const statusSymbol = taskStatusSymbols[status];

	const [isInChangeMode, setIsInChangeMode] = useState(false);
	const changeStatus = useCallback((newStatus: TaskStatus) => {
		setTaskData(id, { status: newStatus }, { dayName });
		setIsInChangeMode(false);
	}, []);

	// TODO: Turn the selector part into a custom element, using shadow DOM
	const exitChangeModeOnEscape = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsInChangeMode(false);
		}
	}, []);
	useEffect(() => {
		if (isInChangeMode) {
			document.addEventListener('keydown', exitChangeModeOnEscape);
		}

		return () => {
			document.removeEventListener('keydown', exitChangeModeOnEscape);
		};
	}, [isInChangeMode]);

	return html`
		<span class="task-status">
			<button
				type="button"
				title="${status}"
				onClick="${() => setIsInChangeMode(!isInChangeMode)}"
			>${statusSymbol}</button>

			${
				isInChangeMode &&
				html`
					<ul>
						${Object.values(TaskStatus).map((taskStatus) => html`
							<li key="${taskStatus}">
								<button
									type="button"
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
