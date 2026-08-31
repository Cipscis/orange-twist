import { h, type JSX } from 'preact';

import { classNames } from 'utils';

import { DragList } from 'components/shared';
import { Task } from './Task';

interface TaskListProps {
	/**
	 * The IDs of the tasks to display.
	 */
	taskIds: readonly number[];
	dayName?: string;
	className?: string;

	onReorder?: (taskIds: readonly number[]) => void;
}

/**
 * Renders a list of specified tasks, which can be
 * reordered via drag & drop.
 */
export function TaskList(
	props: TaskListProps,
): JSX.Element {
	const {
		taskIds,
		dayName,
		className,

		onReorder,
	} = props;

	return <DragList
		class={classNames('task-list', className)}
		onReorder={onReorder}
	>
		{taskIds.map((id) => {
			return <div
				key={id}
				data-drag-list-key={id}
				class="task-list__item"
			>
				<Task
					taskId={id}
					dayName={dayName}
				/>
			</div>;
		})}
	</DragList>;
}
