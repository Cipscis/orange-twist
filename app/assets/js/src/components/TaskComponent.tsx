import { h, type JSX } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import classNames from 'classnames';

import type { TaskInfo } from 'registers/tasks';
import { Command } from 'types/Command';

import {
	setTaskInfo,
	deleteTask,
} from 'registers/tasks';
import { fireCommand } from 'registers/commands';

import { TaskStatusComponent } from './TaskStatusComponent';
import { Markdown } from './shared/Markdown';

interface TaskComponentProps {
	task: Readonly<TaskInfo>;
	dayName?: string;
}

/**
 * Renders a single task, and allows for it to be edited.
 */
export function TaskComponent(props: TaskComponentProps): JSX.Element {
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
		setTaskInfo(id, { name });
	}, [id]);

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
			setTaskInfo(id, { name });
			blurOnNextRender();
			return;
		}
	}, [id, blurOnNextRender]);

	return <div class="task">
		{(() => {
			return <>
				<TaskStatusComponent
					task={task}
					dayName={dayName}
				/>
				<a
					href={`/orange-twist/task?id=${task.id}`}
					class="task__detail-link"
					title="View task"
				>📄</a>
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
						onClick={(e) => {
							const target = e.target;
							if (
								target instanceof HTMLAnchorElement ||
								target instanceof Element && target.matches('a *')
							) {
								// If we clicked within a link, don't enter edit mode
								return;
							}

							setIsInEditMode(true);
						}}
						data-testid="task-component-name"
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
