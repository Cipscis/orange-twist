import { h } from 'preact';
import htm from 'htm';

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { Task } from '../types/Task.js';

import {
	setTaskData,
	deleteTask,
} from '../registers/tasks/index.js';
import { Command, fireCommand } from '../registers/commands/index.js';

import { TaskStatusComponent, TaskStatusComponentProps } from './TaskStatusComponent.js';
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

	const previousName = useRef<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Combine a state variable and `useEffect` to blur the input after re-render
	const [blurOnRenderCount, setBlurOnRenderCount] = useState(0);
	useEffect(() => {
		inputRef.current?.blur();
	}, [blurOnRenderCount]);

	/**
	 * Blur the input after the component re-renders.
	 */
	const blurOnNextRender = useCallback(() => {
		setBlurOnRenderCount((val) => val + 1);
	}, []);

	/**
	 * If there is no task name, delete the task.
	 *
	 * Otherwise, if the name has been updated, save changes.
	 */
	const saveChanges = useCallback(() => {
		if (task.name === '') {
			deleteTask(task.id);
			if (previousName.current !== '') {
				fireCommand(Command.DATA_SAVE);
			}
		} else if (previousName.current !== task.name) {
			fireCommand(Command.DATA_SAVE);
		}
		previousName.current = null;
	}, [task.name, task.id]);

	// Remember the previous name when the input is focused.
	const rememberPreviousName = useCallback((e: FocusEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		previousName.current = input.value;
	}, []);

	// Update the name.
	const nameChangeHandler = useCallback((e: InputEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		const name = input.value;
		setTaskData(id, { name }, { dayName });
	}, [dayName, id]);

	// Blur on "Enter" or "Escape", either committing or discarding changes
	const keydownHandler = useCallback((e: KeyboardEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		if (e.key === 'Enter') {
			input.blur();
			return;
		}

		if (e.key === 'Escape') {
			const name = previousName.current ?? '';
			setTaskData(id, { name }, { dayName });
			blurOnNextRender();
			return;
		}
	}, [id, dayName, blurOnNextRender]);

	return html`
		<div class="task">
			${(() => {
				const taskStatusProps: TaskStatusComponentProps = { task, dayName };

				return html`
					<${TaskStatusComponent} ...${taskStatusProps} />
					<form
						class="task__name"
					>
						<input
							ref="${inputRef}"
							type="text"
							class="task__name-input"
							value="${name}"
							placeholder="Task name"
							size="1"
							onFocus="${rememberPreviousName}"
							onInput="${nameChangeHandler}"
							onKeydown="${keydownHandler}"
							onBlur="${saveChanges}"
						/>

						<${Markdown} content="${name.replace(/</g, '&lt;')}" class="task__name-markdown content" />
					</form>
				`;
			})()}
		</div>
	`;
}
