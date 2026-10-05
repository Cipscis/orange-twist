import { h, type JSX } from 'preact';

import type { Status } from 'database';
import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { Loader } from 'components/shared';

import {
	type TaskStatusPickerLegacySyncProps,
	TaskStatusPickerLegacySync,
} from './TaskStatusPickerLegacySync';

export interface TaskStatusPickerLegacyLoaderProps extends Omit<TaskStatusPickerLegacySyncProps, 'statuses'> {
	statusAsyncDataState: AsyncDataState<readonly Status[]>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving status information. If status information is loaded, uses it to render a task status picker.
 *
 * Renders the status for a specified task, optionally
 * for a specified day.
 *
 * Allows that status to be edited.
 */
export function TaskStatusPickerLegacyLoader(props: TaskStatusPickerLegacyLoaderProps): JSX.Element | null {
	const { statusAsyncDataState } = props;

	if (statusAsyncDataState.type === AsyncDataStateType.INITIAL) {
		return <Loader class="icon-button--loader" />;
	}

	if (statusAsyncDataState.type === AsyncDataStateType.ERROR) {
		// Rely on `useAllStatuses` displaying an alert if status loading failed
		return null;
	}

	return <TaskStatusPickerLegacySync
		{...props}
		statuses={statusAsyncDataState.data}
	/>;
}
