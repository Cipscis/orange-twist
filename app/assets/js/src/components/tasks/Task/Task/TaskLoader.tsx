import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils';

import type { useSettableTask } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { TaskSync } from './TaskSync';

export interface TaskLoaderProps {
	taskDataState: ReturnType<typeof useSettableTask>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving day task information. If day task information is loaded, uses it to render that day task.
 */
export function TaskLoader(props: TaskLoaderProps): JSX.Element {
	const {
		taskDataState,
	} = props;

	if (taskDataState.stateOfGet.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (taskDataState.stateOfGet.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskDataState.stateOfGet.error.message}
		/>;
	}

	return <TaskSync
		task={taskDataState.stateOfGet.data}
		setTask={taskDataState.setData}
	/>;
}
