import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import {
	animate,
	nodeHasAncestor,
	CSSKeyframes,
} from 'util/index';

import { TaskStatus } from 'types/TaskStatus';
import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	deleteDayTask,
	deleteTask,
	getTaskStatusForDay,
	setDayTaskInfo,
	setTaskInfo,
	useAllDayTaskInfo,
	useTaskInfo,
} from 'data';

import * as ui from 'ui';

interface TaskStatusComponentProps {
	taskId: number;
	dayName?: string;
	/** @default false */
	readonly?: boolean;
}

const taskStatusSymbols = {
	[TaskStatus.TODO]: '☐',
	[TaskStatus.IN_PROGRESS]: '▶️',
	[TaskStatus.COMPLETED]: '☑️',

	[TaskStatus.INVESTIGATING]: '🔍',
	[TaskStatus.IN_REVIEW]: '👀',
	[TaskStatus.READY_TO_TEST]: '🧪',
	[TaskStatus.APPROVED_TO_DEPLOY]: '🟢',
	[TaskStatus.WILL_NOT_DO]: '🚫',
} as const satisfies Record<TaskStatus, string>;

/**
 * Renders the status for a specified task, optionally
 * for a specified day.
 *
 * Allows that status to be edited.
 */
export function TaskStatusComponent(props: TaskStatusComponentProps): JSX.Element | null {
	const {
		taskId,
		dayName,
	} = props;
	const taskInfo = useTaskInfo(taskId);

	// Also re-render when any day task info for a specified day changes
	useAllDayTaskInfo(
		useMemo(() => {
			if (dayName) {
				return { taskId };
			}

			// If there's no day name, use an invalid task ID to prevent
			// unnecessary re-renders
			return { taskId: -1 };
		}, [dayName, taskId])
	);

	const readonly = props.readonly ?? false;

	const rootRef = useRef<HTMLElement>(null);
	const optionsRef = useRef<HTMLUListElement>(null);

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
		await animate(optionsRef.current, CSSKeyframes.DISAPPEAR_SCREEN);
		setIsInChangeModeInternal(value);
	}, [setIsInChangeModeInternal]);

	/**
	 * Update task data to reflect new status
	 */
	const changeStatus = useCallback((status: TaskStatus) => {
		if (!taskInfo) {
			return;
		}

		if (dayName) {
			setDayTaskInfo({
				dayName,
				taskId,
			}, { status });
		} else {
			setTaskInfo(taskId, { status });
		}
		setIsInChangeMode(false);
		fireCommand(Command.DATA_SAVE);
	}, [dayName, taskId, taskInfo, setIsInChangeMode]);

	/**
	 * Ask for confirmation, then delete the task.
	 */
	const removeTaskEntirely = useCallback(async () => {
		setIsInChangeMode(false);

		if (!await ui.confirm('Are you sure you want to delete this task?')) {
			return;
		}

		deleteTask(taskId);
		fireCommand(Command.DATA_SAVE);
	}, [taskId, setIsInChangeMode]);

	/**
	 * Ask for confirmation, then remove a task from this component's day.
	 */
	const removeTaskFromDay = useCallback(async () => {
		if (!await ui.confirm(`Are you sure you want to remove this task from ${dayName}?`)) {
			return;
		}

		if (!dayName) {
			return;
		}

		deleteDayTask({ dayName, taskId });
		setIsInChangeMode(false);
		fireCommand(Command.DATA_SAVE);
	}, [dayName, taskId, setIsInChangeMode]);

	/**
	 * Remove the task from the current day, if there is one,
	 * otherwise delete it entirely.
	 */
	const onDeleteButtonClick = useCallback(() => {
		if (dayName) {
			removeTaskFromDay();
		} else {
			removeTaskEntirely();
		}
	}, [dayName, removeTaskFromDay, removeTaskEntirely]);

	// TODO: Turn the selector part into a custom element, using shadow DOM

	/**
	 * Detect if a keypress was "Escape". If it was, exit change mode.
	 */
	const exitChangeModeOnEscape = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsInChangeMode(false);
		}
	}, [setIsInChangeMode]);

	/**
	 * Detect if a click was outside the component. If it was, exit change mode.
	 */
	const exitChangeModeOnOutsideClick = useCallback((e: MouseEvent) => {
		if (
			rootRef.current &&
			e.target instanceof Element
		) {
			if (!nodeHasAncestor(e.target, rootRef.current)) {
				setIsInChangeMode(false);
			}
		}
	}, [setIsInChangeMode]);

	// Set up event listeners for exiting change mode.
	useEffect(() => {
		const eventListenerAbortController = new AbortController();
		const { signal } = eventListenerAbortController;

		if (isInChangeMode) {
			document.addEventListener('keydown', exitChangeModeOnEscape, { signal });
			document.addEventListener('click', exitChangeModeOnOutsideClick, { signal });
		}

		return () => {
			eventListenerAbortController.abort();
		};
	}, [isInChangeMode, exitChangeModeOnEscape, exitChangeModeOnOutsideClick]);

	const status = (() => {
		if (dayName) {
			return getTaskStatusForDay({ dayName, taskId });
		}

		return taskInfo?.status;
	})();

	if (!status) {
		return null;
	}

	const statusSymbol = taskStatusSymbols[status];

	return <span
		class="task-status"
		ref={rootRef}
	>
		{readonly
			? <span
				class="task-status__indicator task-status__indicator--readonly"
				title={status}
			>{statusSymbol}</span>
			: <button
				type="button"
				class="task-status__indicator"
				title={`${status} (click to edit)`}
				onClick={() => setIsInChangeMode(!isInChangeMode)}
			>
				<span aria-hidden>{statusSymbol}</span>
			</button>
		}

		{
			isInChangeMode &&
			<ul
				class="task-status__options"
				ref={optionsRef}
			>
				<li class="task-status__optgroup">
					<ul class="task-status__optgroup-list">
						{Object.values(TaskStatus).map((taskStatus) => (
							<li
								key={taskStatus}
								class="task-status__option"
							>
								<button
									type="button"
									class="task-status__option-button"
									title={taskStatus}
									onClick={() => changeStatus(taskStatus)}
								>
									<span aria-hidden>{taskStatusSymbols[taskStatus]}</span>
								</button>
							</li>
						))}
					</ul>
				</li>

				<li class="task-status__optgroup">
					<ul class="task-status__optgroup-list">
						<li class="task-status__option">
							<button
								type="button"
								class="task-status__option-button"
								title="Delete"
								onClick={onDeleteButtonClick}
							>
								<span aria-hidden>❌</span>
							</button>
						</li>
					</ul>
				</li>
			</ul>
		}
	</span>;
}
