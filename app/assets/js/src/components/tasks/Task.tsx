import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { classNames, useBlurCallback } from 'util/index';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setTaskInfo,
	deleteTask,
	useTaskInfo,
} from 'data';

import { TaskStatusComponent } from './TaskStatusComponent';
import { Markdown } from '../shared/Markdown';
import { IconButton } from 'components/shared/IconButton';

interface TaskProps {
	taskId: number;
	dayName?: string;
}

/**
 * Renders a single task, and allows for it to be edited.
 */
export function Task(props: TaskProps): JSX.Element | null {
	const { taskId, dayName } = props;
	const taskInfo = useTaskInfo(taskId);

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
		if (!taskInfo) {
			return;
		}

		if (taskInfo.name === '') {
			deleteTask(taskInfo.id);
			if (previousName.current !== '') {
				fireCommand(Command.DATA_SAVE);
			}
		} else if (previousName.current !== taskInfo.name) {
			fireCommand(Command.DATA_SAVE);
		}
		previousName.current = null;
	}, [taskInfo]);

	/**
	 * Save any change, and leave edit mode.
	 */
	const leaveEditMode = useCallback(() => {
		saveChanges();
		setIsInEditMode(false);
	}, [saveChanges]);

	// Leave edit mode on blur, but not when the tab loses focus
	useBlurCallback(
		inputRef,
		leaveEditMode,
		isInEditMode,
	);

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
		if (!taskInfo) {
			return;
		}

		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		const name = input.value;
		setTaskInfo(taskInfo.id, { name });
	}, [taskInfo]);

	// Blur on "Enter" or "Escape", either committing or discarding changes
	const keydownHandler = useCallback((e: KeyboardEvent) => {
		if (!taskInfo) {
			return;
		}

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
			setTaskInfo(taskInfo.id, { name });
			blurOnNextRender();
			return;
		}
	}, [taskInfo, blurOnNextRender]);

	if (!taskInfo) {
		return null;
	}

	return <div class="task">
		{(() => {
			return <>
				<TaskStatusComponent
					taskId={taskInfo.id}
					dayName={dayName}
				/>
				<a
					href={`/task/?id=${taskInfo.id}`}
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
							value={taskInfo.name}
							placeholder="Task name"
							size={1}
							onFocus={rememberPreviousName}
							onInput={nameChangeHandler}
							onKeyDown={keydownHandler}
						/>
					}

					<Markdown
						content={taskInfo.name.replace(/</g, '&lt;')}
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

					<IconButton
						class="task__name-edit"
						title="Edit task name"
						icon="✏️"
						onClick={() => setIsInEditMode(true)}
					/>
				</form>
			</>;
		})()}
	</div>;
}
