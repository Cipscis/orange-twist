import { h } from 'preact';
import htm from 'htm';

import { Task } from '../types/Task.js';

import { TaskStatusComponent, TaskStatusComponentProps } from './TaskStatusComponent.js';
import { useCallback } from 'preact/hooks';
import { setTaskData } from '../registers/tasks/tasksRegister.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface TaskComponentProps {
	task: Readonly<Task>;
	dayName?: string;
}

export function TaskComponent(props: TaskComponentProps) {
	const { task, dayName } = props;
	const { id, name } = task;

	const nameChangeHandler = useCallback((e: InputEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		const name = input.value;
		setTaskData(id, { name }, { dayName });
	}, []);

	const enterHandler = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Enter' && e.target instanceof HTMLElement) {
			e.target.blur();
			// TODO: Save if anything was change
		}
	}, []);

	return html`
		<div class="task">
			${(() => {
				const taskStatusProps: TaskStatusComponentProps = { task, dayName };

				return html`
					<${TaskStatusComponent} ...${taskStatusProps} />
					<div
						class="task__name"
						data-content="${name}"
					>
						<input
							type="text"
							value="${name}"
							size="1"
							onInput="${nameChangeHandler}"
							onKeydown="${enterHandler}"
						/>
					</div>
				`;
			})()}
		</div>
	`;
}
