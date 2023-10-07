import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import classNames from 'classnames';

import { Task } from '../types/Task.js';

import {
	setTaskData,
	deleteTask,
} from '../registers/tasks/index.js';
import { Command, fireCommand } from '../registers/commands/index.js';

import { TaskStatusComponent } from './TaskStatusComponent.js';
import { Markdown } from './shared/Markdown.js';

interface TaskComponentProps {
	task: Readonly<Task>;
	dayName?: string;
}

/**
 * Renders a single task, and allows for it to be edited.
 */
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

	const [isInEditMode, setIsInEditMode] = useState(false);

	// Automatically focus on input when entering edit mode
	useEffect(() => {
		if (isInEditMode) {
			inputRef.current?.focus();
		}
	}, [isInEditMode]);

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

	/**
	 * Save any change, and leave edit mode.
	 */
	const leaveEditMode = useCallback(() => {
		saveChanges();
		setIsInEditMode(false);
	}, [saveChanges]);

	// Remember the previous name when the input is focused.
	const rememberPreviousName = useCallback((e: FocusEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		previousName.current = input.value;
	}, []);

	// Update the name.
	const nameChangeHandler = useCallback((e: Event) => {
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

	return <div class="task">
		{(() => {
			return <>
				<TaskStatusComponent
					task={task}
					dayName={dayName}
				/>
				<form
					class="task__name"
				>
					{
						isInEditMode &&
						<input
							ref={inputRef}
							type="text"
							class="task__name-input"
							value={name}
							placeholder="Task name"
							size={1}
							onFocus={rememberPreviousName}
							onInput={nameChangeHandler}
							onKeyDown={keydownHandler}
							onBlur={leaveEditMode}
						/>
					}

					<Markdown
						content={name.replace(/</g, '&lt;')}
						class={classNames('task__name-display', {
							'task__name-display--hidden': isInEditMode,
						})}
						onClick={() => setIsInEditMode(true)}
					/>

					<button
						type="button"
						class="task__name-edit js-task__name-edit"
						label="Edit task name"
						onClick={() => setIsInEditMode(true)}
					>✏️</button>
				</form>
			</>;
		})()}
	</div>;
}
