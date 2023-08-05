import { h } from 'preact';
import htm from 'htm';

import { Task } from '../types/Task.js';

import { TaskStatusComponent, TaskStatusComponentProps } from './TaskStatus.js';
import { useCallback } from 'preact/hooks';
import { setTaskData } from '../registers/tasks/tasksRegister.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface TaskComponentProps {
	task: Readonly<Task>;
}

export function TaskComponent(props: TaskComponentProps) {
	const { task } = props;
	const { id, name } = task;

	const nameChangeHandler = useCallback((e: InputEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		const name = input.value;
		setTaskData(id, { name });
	}, []);

	return html`
		<div class="task">
			${(() => {
				const taskStatusProps: TaskStatusComponentProps = { task };

				return html`<span>
					<${TaskStatusComponent} ...${taskStatusProps} />
					<i>${id}</i>
					<input
						type="text"
						value="${name}"
						onInput="${nameChangeHandler}"
					/>
				</span>`;
			})()}
		</div>
	`;
}
