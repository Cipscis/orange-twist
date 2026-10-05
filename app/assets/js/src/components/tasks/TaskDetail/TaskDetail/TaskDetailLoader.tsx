import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils';

import type { useSettableTask } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { TaskDetailSync } from './TaskDetailSync';

export interface TaskDetailLoaderProps {
	taskDataState: ReturnType<typeof useSettableTask>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving task information. If day task information is loaded, uses it to render a detailed view of that task, including its notes,.
 */
export function TaskDetailLoader(props: TaskDetailLoaderProps): JSX.Element {
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

	return <TaskDetailSync
		task={taskDataState.stateOfGet.data}
		setTask={taskDataState.setData}
	/>;
}
