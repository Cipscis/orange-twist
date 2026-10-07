import {
	h,
	Fragment,
	type JSX,
} from 'preact';

import { DayTaskDetail } from '../DayTaskDetail/DayTaskDetail';

export interface DayTaskDetailListSyncProps {
	dayTaskIds: readonly number[];
	selectedDayTaskId?: number;
}

/**
 * Renders a list of day tasks in detail.
 */
export function DayTaskDetailListSync(props: DayTaskDetailListSyncProps): JSX.Element {
	const {
		dayTaskIds,
		selectedDayTaskId,
	} = props;

	return <>
		{dayTaskIds.map((id) => (
			<DayTaskDetail
				key={id}
				dayTaskId={id}
				open={id === selectedDayTaskId}
			/>
		))}
	</>;
}
