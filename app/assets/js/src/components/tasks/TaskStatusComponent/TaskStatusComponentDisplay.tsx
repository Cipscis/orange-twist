import { h, type JSX } from 'preact';

import { useAllStatuses } from 'database';
import { AsyncDataStateType } from 'utils';

import { Loader } from 'components/shared';

import {
	type TaskStatusComponentProps,
	TaskStatusComponent,
} from './TaskStatusComponent';

export type TaskStatusComponentDisplayProps = Omit<TaskStatusComponentProps, 'statuses'>;

/**
 * Renders the status for a specified task, optionally
 * for a specified day.
 *
 * Allows that status to be edited.
 */
export function TaskStatusComponentDisplay(props: TaskStatusComponentDisplayProps): JSX.Element | null {
	const statusAsyncDataState = useAllStatuses();

	if (statusAsyncDataState.type === AsyncDataStateType.INITIAL) {
		return <Loader class="icon-button--loader" />;
	}

	if (
		statusAsyncDataState.type === AsyncDataStateType.ERROR ||
		statusAsyncDataState.type === AsyncDataStateType.ABORTED
	) {
		// Rely on `useAllStatuses` displaying an alert if status loading failed
		return null;
	}

	return <TaskStatusComponent
		{...props}
		statuses={statusAsyncDataState.data}
	/>;
}
