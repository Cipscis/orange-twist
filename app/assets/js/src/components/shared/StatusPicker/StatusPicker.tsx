import { h, type JSX } from 'preact';

import { useAllStatuses } from 'database';

import type { StatusPickerSyncProps } from './StatusPickerSync';
import { StatusPickerLoader } from './StatusPickerLoader';

export type StatusPickerProps = Omit<StatusPickerSyncProps, 'statuses'>;

/**
 * Asynchronously retrieves all status information and passes it on to render a status picker once loaded.
 */
export function StatusPicker(props: StatusPickerProps): JSX.Element | null {
	const statusAsyncDataState = useAllStatuses();

	return <StatusPickerLoader
		{...props}
		statusAsyncDataState={statusAsyncDataState}
	/>;
}
