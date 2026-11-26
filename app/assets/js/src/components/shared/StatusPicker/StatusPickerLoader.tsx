import { h, type JSX } from 'preact';

import type { Status } from 'database';
import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncData';

import { Loader } from 'components/shared';

import {
	type StatusPickerSyncProps,
	StatusPickerSync,
} from './StatusPickerSync';

export interface StatusPickerLoaderProps extends Omit<StatusPickerSyncProps, 'status' | 'statuses'> {
	statusAsyncState: AsyncActionState<Status>;
	statusesAsyncState: AsyncActionState<readonly Status[]>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving status information. If status information is loaded, uses it to render a status picker.
 */
export function StatusPickerLoader(props: StatusPickerLoaderProps): JSX.Element | null {
	const {
		statusAsyncState,
		statusesAsyncState,
	} = props;

	if (
		statusAsyncState.type === AsyncActionStateType.INITIAL ||
		statusesAsyncState.type === AsyncActionStateType.INITIAL
	) {
		return <Loader class="icon-button--loader" />;
	}

	if (statusAsyncState.type === AsyncActionStateType.ERROR) {
		// TODO: Handle this error state somehow
		return null;
	}

	if (statusesAsyncState.type === AsyncActionStateType.ERROR) {
		// Rely on `useAllStatuses` displaying an alert if status loading failed
		return null;
	}

	return <StatusPickerSync
		{...props}
		status={statusAsyncState.data}
		statuses={statusesAsyncState.data}
	/>;
}
