import { h, type JSX } from 'preact';

import type { Status } from 'database';
import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { Loader } from 'components/shared';

import {
	type StatusPickerSyncProps,
	StatusPickerSync,
} from './StatusPickerSync';

export interface StatusPickerLoaderProps extends Omit<StatusPickerSyncProps, 'status' | 'statuses'> {
	statusAsyncDataState: AsyncDataState<Status>;
	statusesAsyncDataState: AsyncDataState<readonly Status[]>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving status information. If status information is loaded, uses it to render a status picker.
 */
export function StatusPickerLoader(props: StatusPickerLoaderProps): JSX.Element | null {
	const {
		statusAsyncDataState,
		statusesAsyncDataState,
	} = props;

	if (
		statusAsyncDataState.type === AsyncDataStateType.INITIAL ||
		statusesAsyncDataState.type === AsyncDataStateType.INITIAL
	) {
		return <Loader class="icon-button--loader" />;
	}

	if (statusAsyncDataState.type === AsyncDataStateType.ERROR) {
		// TODO: Handle this error state somehow
		return null;
	}

	if (statusesAsyncDataState.type === AsyncDataStateType.ERROR) {
		// Rely on `useAllStatuses` displaying an alert if status loading failed
		return null;
	}

	return <StatusPickerSync
		{...props}
		status={statusAsyncDataState.data}
		statuses={statusesAsyncDataState.data}
	/>;
}
