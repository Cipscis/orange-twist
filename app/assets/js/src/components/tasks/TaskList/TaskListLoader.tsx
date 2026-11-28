import { h, type JSX } from 'preact';

import {
	AsyncActionStateType,
	type AsyncActionState,
} from 'utils/asyncAction';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { TaskListSync } from './TaskListSync';

export interface TaskListLoaderProps {
	taskIdsDataState: AsyncActionState<readonly number[]>;
	setTaskIdOrder?: (data: readonly number[]) => Promise<void>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving a list of task IDs. If those task IDs are loaded, uses them to render a list of those tasks.
 */
export function TaskListLoader(props: TaskListLoaderProps): JSX.Element {
	const {
		taskIdsDataState,
		setTaskIdOrder,
	} = props;

	if (taskIdsDataState.type === AsyncActionStateType.INITIAL) {
		return <Loader />;
	}

	if (taskIdsDataState.type === AsyncActionStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskIdsDataState.error.message}
		/>;
	}

	return <TaskListSync
		taskIds={taskIdsDataState.data}
		setTaskIdOrder={setTaskIdOrder}
	/>;
}
