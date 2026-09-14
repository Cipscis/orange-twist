import { h, type JSX } from 'preact';
import {
	useCallback,
	useMemo,
} from 'preact/hooks';

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
import type { Status } from 'database';

import * as ui from 'ui';
import { StatusPicker } from 'components/shared';

export interface TaskStatusComponentProps {
	taskId: number;
	dayName?: string;

	statuses: Status[];
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

		statuses,
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
	const changeStatus = useCallback((status: number) => {
		if (!taskInfo) {
			return;
		}

		const statusAlias = statuses.find(({ id }) => id === status)!.alias;

		if (dayName) {
			setDayTaskInfo({
				dayName,
				taskId,
			}, { status: statusAlias });
		} else {
			setTaskInfo(taskId, { status: statusAlias });
		}
		fireCommand(Command.DATA_SAVE);
	}, [statuses, dayName, taskId, taskInfo]);

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
		const statusAlias = (() => {
			if (dayName) {
				return getTaskStatusForDay({ dayName, taskId });
			}

			return taskInfo?.status ?? null;
		})();

		const status = statuses.find(({ alias }) => alias === statusAlias);

		return status;
	})();

	if (!status) {
		return null;
	}

	return <StatusPicker
		status={status}
		statuses={statuses}
		onStatusSelect={changeStatus}
		onDelete={onDeleteButtonClick}
		deleteButtonTitle={deleteButtonTitle}
	/>;
}
