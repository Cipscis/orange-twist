import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import {
	nodeHasAncestor,
	useCloseWatcher,
} from 'util/index';

import {
	TaskStatus,
	TaskStatusName,
	TaskStatusSymbol,
} from 'types/TaskStatus';
import { ButtonVariant } from 'components/shared/types';

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
import { TaskStatusButton } from './TaskStatusButton';

interface TaskStatusComponentProps {
	taskId: number;
	dayName?: string;
	/** @default false */
	readonly?: boolean;
}

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
	const popoverRef = useRef<HTMLDialogElement>(null);
	const optionsRef = useRef<HTMLUListElement>(null);

	// Used to prevent a closing animation display on initial render
	const canAnimateRef = useRef<null | true>(null);

	const [isInChangeMode, setIsInChangeMode] = useState(false);

	const exitChangeMode = useCallback(() => {
		setIsInChangeMode(false);
	}, []);

	const enterChangeMode = useCallback(() => {
		setIsInChangeMode(true);
	}, []);

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
	 * The text to use for the title of the delete button.
	 */
	const deleteButtonTitle = dayName
		? 'Remove task from day'
		: 'Delete task';

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

	// Show and hide the popover when we enter or leave change mode
	useEffect(() => {
		if (!canAnimateRef.current && isInChangeMode) {
			canAnimateRef.current = true;
		}

		if (!popoverRef.current) {
			return;
		}

		if (isInChangeMode) {
			popoverRef.current.show();
		} else {
			popoverRef.current.close();
		}
	}, [isInChangeMode]);

	// Add "light dismiss" behaviour - close when clicking outside popover
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

	// Set up event listeners for closing the popover on UI signals like pressing the "Escape" key
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

	const statusSymbol = TaskStatusSymbol[status];
	const statusName = TaskStatusName[status];

	return <span
		class="task-status"
		ref={rootRef}
	>
		{readonly
			? <IconButton
				disabled
				title={statusName}
				icon={statusSymbol}
				style={{
					color: `var(--colour-task--${status})`,
				}}
			/>
			: <IconButton
				title={`${statusName} (click to edit)`}
				icon={statusSymbol}
				onClick={enterChangeMode}
				style={{
					color: `var(--colour-task--${status})`,
				}}
			/>
		}

		<dialog
			class="task-status__popover"
			ref={popoverRef}
			data-animate={canAnimateRef.current}
			tabindex={-1}
			inert={!isInChangeMode}
		>
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
								<TaskStatusButton
									status={taskStatus}
									onStatusSelect={changeStatus}
								/>
							</li>
						))}
					</ul>
				</li>

				<li class="task-status__optgroup">
					<ul class="task-status__optgroup-list">
						<li class="task-status__option">
							<IconButton
								variant={ButtonVariant.SECONDARY}
								title={deleteButtonTitle}
								icon="🗑️"
								onClick={onDeleteButtonClick}
							/>
						</li>
					</ul>
				</li>
			</ul>
		</dialog>
	</span>;
}
