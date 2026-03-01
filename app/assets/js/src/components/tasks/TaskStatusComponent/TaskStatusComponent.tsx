import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import {
	animate,
	CSSKeyframes,
	nodeHasAncestor,
	useCloseWatcher,
} from 'utils';

import {
	TaskStatus,
	TaskStatusName,
	TaskStatusSymbol,
} from 'types/TaskStatus';

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
import {
	ButtonVariant,
	IconButton,
} from 'components/shared';
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

	const dayTaskIdentifier = useMemo(() => {
		if (dayName) {
			return { taskId };
		}

		// If there's no day name, use an invalid task ID to prevent
		// unnecessary re-renders
		return { taskId: -1 };
	}, [dayName, taskId]);

	// Also re-render when any day task info for a specified day changes
	useAllDayTaskInfo(
		dayTaskIdentifier,
		{ async: true },
	);

	const readonly = props.readonly ?? false;

	const rootRef = useRef<HTMLElement>(null);
	const popoverRef = useRef<HTMLDialogElement>(null);
	const optionsRef = useRef<HTMLUListElement>(null);

	// Used to prevent a closing animation display on initial render
	const canAnimateRef = useRef<null | true>(null);

	const [isClosing, setIsClosing] = useState(false);
	const [isInChangeMode, setIsInChangeMode] = useState(false);

	/** Used to avoid rendering contents of closed dialogs in order to reduce DOM size */
	const renderContents = isInChangeMode || isClosing;

	const exitChangeMode = useCallback(() => {
		setIsInChangeMode(false);
		setIsClosing(true);
	}, []);

	const enterChangeMode = useCallback(() => {
		setIsInChangeMode(true);
	}, []);

	const positionAnchorId = useId();
	const positionAnchorName = `--taskStatus_${positionAnchorId}`;

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
	 * Detect if a click was detected on the backdrop. If it was, exit change mode.
	 */
	const exitChangeModeOnBackdropClick = useCallback((e: MouseEvent) => {
		// The <dialog> element itself is inert, so any detected clicks must have been on the backdrop
		if (e.target === popoverRef.current) {
			exitChangeMode();
		}
	}, [exitChangeMode]);

	// Show and hide the popover when we enter or leave change mode
	useEffect(() => {
		if (!canAnimateRef.current) {
			if (!isInChangeMode) {
				return;
			}
			canAnimateRef.current = true;
		}

		const popover = popoverRef.current;
		if (!popover) {
			return;
		}

		if (isInChangeMode) {
			popover.showModal();
			// The `opening` attribute is used to adjust z-index
			popover.setAttribute('opening', '');
			const animation = animate(popover, CSSKeyframes.APPEAR_SCREEN);
			animation.finished.then(() => popover.removeAttribute('opening'));
		} else {
			const animation = animate(popover, CSSKeyframes.DISAPPEAR_SCREEN);
			animation.finished.then(() => {
				popover.close();
				setIsClosing(false);
			});
		}
	}, [isInChangeMode]);

	// Add "light dismiss" behaviour - close when clicking on backdrop
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		if (isInChangeMode) {
			document.addEventListener('click', exitChangeModeOnBackdropClick, { signal });
		}

		return () => {
			controller.abort();
		};
	}, [isInChangeMode, exitChangeModeOnBackdropClick]);

	// Prevent clicks from within the dialog from toggling summary elements they're contained in
	useEffect(() => {
		const popover = popoverRef.current;
		if (!popover) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		if (isInChangeMode) {
			popover.addEventListener('click', (e) => {
				e.preventDefault();
			}, { signal });
		}

		return () => {
			controller.abort();
		};
	}, [isInChangeMode]);

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
		style={{
			anchorName: positionAnchorName,
		}}
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
			tabindex={-1}
			inert={!isInChangeMode}
			style={{
				positionAnchor: positionAnchorName,
			}}
		>
			{renderContents &&
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
			}
		</dialog>
	</span>;
}
