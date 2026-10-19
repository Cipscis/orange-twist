import { h, type JSX } from 'preact';

import { DragList } from 'components/shared';
import { DayTask } from '../DayTask';

export interface DayTaskListSyncProps {
	dayTaskIds: readonly number[];
	setDayTaskIdOrder: (data: readonly number[]) => Promise<void>;
}

/**
 * Renders a re-orderable list of day tasks.
 */
export function DayTaskListSync(props: DayTaskListSyncProps): JSX.Element {
	const {
		dayTaskIds,
		setDayTaskIdOrder,
	} = props;

	return <DragList
		class="task-list"
		onReorder={setDayTaskIdOrder}
	>
		{dayTaskIds.map((id) => (
			<div
				key={id}
				// TODO: This should be baked into DragList, somehow
				data-drag-list-key={id}
				class="task-list__item"
			>
				<DayTask
					dayTaskId={id}
				/>
			</div>
		))}
	</DragList>;
}
