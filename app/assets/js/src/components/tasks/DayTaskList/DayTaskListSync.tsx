import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { SaveType, type SaveAction } from 'database';

import { DragList } from 'components/shared';
import { DayTask } from '../DayTask';

export interface DayTaskListSyncProps {
	dayTaskIds: readonly number[];
}

/**
 * Renders a re-orderable list of day tasks.
 */
export function DayTaskListSync(props: DayTaskListSyncProps): JSX.Element {
	const {
		dayTaskIds,
	} = props;

	/**
	 * When provided an updated list of day task IDs by {@linkcode DragList}, save each of those day tasks with a new sortIndex.
	 */
	const reorderDayTasks = useCallback((order: readonly number[]) => {
		const saveActions: readonly Extract<
			SaveAction, { type: typeof SaveType.DAY_TASK; }
		>[] = order.map((id, sortIndex) => ({
			type: SaveType.DAY_TASK,
			id,
			dayTask: { sortIndex },
		}));

		fireCommand(Command.DATA_SAVE, saveActions);
	}, []);

	return <DragList
		class="task-list"
		onReorder={reorderDayTasks}
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
