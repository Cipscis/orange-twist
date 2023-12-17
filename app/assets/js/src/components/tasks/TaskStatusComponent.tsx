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
	useCloseWatcher,
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
import { IconButton } from 'components/shared/IconButton';

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

const taskStatusNames = {
	[TaskStatus.TODO]: 'Todo',
	[TaskStatus.IN_PROGRESS]: 'In progress',
	[TaskStatus.COMPLETED]: 'Completed',

	[TaskStatus.INVESTIGATING]: 'Investigating',
	[TaskStatus.IN_REVIEW]: 'In review',
	[TaskStatus.READY_TO_TEST]: 'Ready to test',
	[TaskStatus.APPROVED_TO_DEPLOY]: 'Approved to deploy',
	[TaskStatus.WILL_NOT_DO]: 'Will not do',
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

	const exitChangeMode = useCallback(() => {
		setIsInChangeMode(false);
	}, [setIsInChangeMode]);

	/**
	 * Update task data to reflect new status.
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
		exitChangeMode();
		fireCommand(Command.DATA_SAVE);
	}, [dayName, taskId, taskInfo, exitChangeMode]);

	/**
	 * Ask for confirmation, then delete the task.
	 */
	const removeTaskEntirely = useCallback(async () => {
		if (!await ui.confirm('Are you sure you want to delete this task?')) {
			return;
		}

		deleteTask(taskId);
		fireCommand(Command.DATA_SAVE);
	}, [taskId]);

	/**
	 * Ask for confirmation, then remove a task from this component's day.
	 */
	const removeTaskFromDay = useCallback(async () => {
		if (!dayName) {
			return;
		}

		if (!await ui.confirm(`Are you sure you want to remove this task from ${dayName}?`)) {
			return;
		}

		deleteDayTask({ dayName, taskId });
		fireCommand(Command.DATA_SAVE);
	}, [dayName, taskId]);

	/**
	 * Remove the task from the current day, if there is one,
	 * otherwise delete it entirely.
	 */
	const onDeleteButtonClick = useCallback(() => {
		exitChangeMode();
		if (dayName) {
			removeTaskFromDay();
		} else {
			removeTaskEntirely();
		}
	}, [exitChangeMode, dayName, removeTaskFromDay, removeTaskEntirely]);

	/**
	 * Detect if a click was outside the component. If it was, exit change mode.
	 */
	const exitChangeModeOnOutsideClick = useCallback((e: MouseEvent) => {
		if (
			rootRef.current &&
			e.target instanceof Element
		) {
			if (!nodeHasAncestor(e.target, rootRef.current)) {
				exitChangeMode();
			}
		}
	}, [exitChangeMode]);

	// Set up event listeners for exiting change mode.
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		if (isInChangeMode) {
			document.addEventListener('click', exitChangeModeOnOutsideClick, { signal });
		}

		return () => {
			controller.abort();
		};
	}, [isInChangeMode, exitChangeModeOnOutsideClick]);

	useCloseWatcher(exitChangeMode, isInChangeMode);

	const status = (() => {
		if (dayName) {
			return getTaskStatusForDay({ dayName, taskId });
		}

		return taskInfo?.status ?? null;
	})();

	if (!status) {
		return null;
	}

	const statusSymbol = taskStatusSymbols[status];
	const statusName = taskStatusNames[status];

	return <span
		class="task-status"
		ref={rootRef}
	>
		{readonly
			? <IconButton
				disabled
				title={statusName}
				icon={statusSymbol}
			/>
			: <IconButton
				title={`${statusName} (click to edit)`}
				icon={statusSymbol}
				onClick={() => setIsInChangeMode(!isInChangeMode)}
			/>
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
								<IconButton
									variant="secondary"
									title={taskStatusNames[taskStatus]}
									icon={taskStatusSymbols[taskStatus]}
									onClick={() => changeStatus(taskStatus)}
								/>
							</li>
						))}
					</ul>
				</li>

				<li class="task-status__optgroup">
					<ul class="task-status__optgroup-list">
						<li class="task-status__option">
							<IconButton
								variant="secondary"
								title="Delete"
								icon="❌"
								onClick={onDeleteButtonClick}
							/>
						</li>
					</ul>
				</li>
			</ul>
		}
	</span>;
}
