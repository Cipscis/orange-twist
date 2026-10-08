import {
	h,
	Fragment,
	type JSX,
} from 'preact';

import { DayTaskDetail } from '../DayTaskDetail/DayTaskDetail';

export interface DayTaskDetailListSyncProps {
	dayTaskIds: readonly number[];
	currentDayTaskId?: number;
}

/**
 * Renders a list of day tasks in detail.
 */
export function DayTaskDetailListSync(props: DayTaskDetailListSyncProps): JSX.Element {
	const {
		dayTaskIds,
		currentDayTaskId,
	} = props;

	// Open the current day task if possible, otherwise open the last one
	const currentDayTaskIndex = currentDayTaskId && dayTaskIds.findIndex((id) => id === currentDayTaskId);
	const openIndex = currentDayTaskIndex ?? dayTaskIds.length - 1;

	return <>
		{dayTaskIds.map((id, i) => (
			<DayTaskDetail
				key={id}
				dayTaskId={id}
				open={i === openIndex}
			/>
		))}
	</>;
}
