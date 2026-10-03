import { h, type JSX } from 'preact';

import type { Status } from 'database';
import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { Loader } from 'components/shared';

import {
	type StatusPickerSyncProps,
	StatusPickerSync,
} from './StatusPickerSync';

export interface StatusPickerLoaderProps extends Omit<StatusPickerSyncProps, 'statuses'> {
	statusAsyncDataState: AsyncDataState<readonly Status[]>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving status information. If status information is loaded, uses it to render a status picker.
 */
export function StatusPickerLoader(props: StatusPickerLoaderProps): JSX.Element | null {
	const { statusAsyncDataState } = props;

	if (statusAsyncDataState.type === AsyncDataStateType.INITIAL) {
		return <Loader class="icon-button--loader" />;
	}

	if (statusAsyncDataState.type === AsyncDataStateType.ERROR) {
		// Rely on `useAllStatuses` displaying an alert if status loading failed
		return null;
	}

	return <StatusPickerSync
		{...props}
		statuses={statusAsyncDataState.data}
	/>;
}
