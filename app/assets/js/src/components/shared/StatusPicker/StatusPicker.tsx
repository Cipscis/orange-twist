import { h, type JSX } from 'preact';

import { useAllStatuses, useStatus } from 'database';

import type { StatusPickerSyncProps } from './StatusPickerSync';
import { StatusPickerLoader } from './StatusPickerLoader';

export type StatusPickerProps = Omit<
	StatusPickerSyncProps, 'status' | 'statuses'
> & {
	status: number;
};

/**
 * Asynchronously retrieves all status information and passes it on to render a status picker once loaded.
 */
export function StatusPicker(props: StatusPickerProps): JSX.Element | null {
	const {
		status,
	} = props;

	const statusesAsyncDataState = useAllStatuses();
	const statusAsyncDataState = useStatus(status);

	return <StatusPickerLoader
		{...props}
		statusAsyncDataState={statusAsyncDataState}
		statusesAsyncDataState={statusesAsyncDataState}
	/>;
}
