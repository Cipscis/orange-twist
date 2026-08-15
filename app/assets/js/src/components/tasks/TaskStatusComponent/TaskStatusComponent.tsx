import { h, type JSX } from 'preact';
import {
	useCallback,
	useMemo,
} from 'preact/hooks';

import type {
	TaskStatus,
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
import { StatusPicker } from 'components/shared';

export interface TaskStatusComponentProps {
	taskId: number;
	dayName?: string;
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
		fireCommand(Command.DATA_SAVE);
	}, [dayName, taskId, taskInfo]);

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
		if (dayName) {
			removeTaskFromDay();
		} else {
			removeTaskEntirely();
		}
	}, [dayName, removeTaskFromDay, removeTaskEntirely]);

	/**
	 * The text to use for the title of the delete button.
	 */
	const deleteButtonTitle = dayName
		? 'Remove task from day'
		: 'Delete task';

	const status = (() => {
		if (dayName) {
			return getTaskStatusForDay({ dayName, taskId });
		}

		return taskInfo?.status ?? null;
	})();

	if (!status) {
		return null;
	}

	return <StatusPicker
		status={status}
		onStatusSelect={changeStatus}
		onDelete={onDeleteButtonClick}
		deleteButtonTitle={deleteButtonTitle}
	/>;
}
