import { h } from 'preact';
import htm from 'htm';

import { Task } from '../types/Task.js';

import { TaskStatusComponent, TaskStatusComponentProps } from './TaskStatusComponent.js';
import { useCallback, useContext, useRef } from 'preact/hooks';
import { setTaskData } from '../registers/tasks/tasksRegister.js';

import { OrangeTwistContext } from './OrangeTwist.js';
import { Markdown } from './Markdown.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface TaskComponentProps {
	task: Readonly<Task>;
	dayName?: string;
}

export function TaskComponent(props: TaskComponentProps) {
	const { task, dayName } = props;
	const { id, name } = task;

	const api = useContext(OrangeTwistContext);

	const dirtyFlag = useRef(false);

	/**
	 * Save changes if there were any, then clear `dirtyFlag`.
	 */
	const saveChanges = useCallback(() => {
		if (dirtyFlag.current) {
			api.save();
			dirtyFlag.current = false;
		}
	}, [api]);

	const nameChangeHandler = useCallback((e: InputEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		const name = input.value;
		setTaskData(id, { name }, { dayName });
		dirtyFlag.current = true;
	}, [dayName, id]);

	const enterHandler = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Enter' && e.target instanceof HTMLElement) {
			e.target.blur();
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
					>
						<${Markdown} content="${name}" class="task__name-markdown content" />
						<input
							type="text"
							value="${name}"
							size="1"
							onInput="${nameChangeHandler}"
							onKeydown="${enterHandler}"
							onBlur="${saveChanges}"
						/>
					</div>
				`;
			})()}
		</div>
	`;
}
