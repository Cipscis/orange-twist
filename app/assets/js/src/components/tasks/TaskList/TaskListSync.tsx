import { h, type JSX } from 'preact';

import { DragList } from 'components/shared';
import { Task } from '../Task';

export interface TaskListSyncProps {
	taskIds: readonly number[];
	setTaskIdOrder: (data: readonly number[]) => Promise<void>;
}

/**
 * Renders a re-orderable list of tasks.
 */
export function TaskListSync(props: TaskListSyncProps): JSX.Element {
	const {
		taskIds,
		setTaskIdOrder,
	} = props;

	return <DragList
		class="task-list"
		onReorder={setTaskIdOrder}
	>
		{taskIds.map((id) => (
			<div
				key={id}
				// TODO: This should be baked into DragList, somehow
				data-drag-list-key={id}
				class="task-list__item"
			>
				<Task
					taskId={id}
				/>
			</div>
		))}
	</DragList>;
}
