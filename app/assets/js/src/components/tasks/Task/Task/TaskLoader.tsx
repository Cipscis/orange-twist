import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils/asyncData';

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
 * Handles the loading, error, and success states for asynchronously retrieving task information. If task information is loaded, uses it to render that task.
 */
export function TaskLoader(props: TaskLoaderProps): JSX.Element {
	const {
		taskDataState,
	} = props;

	if (taskDataState.getterState.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (taskDataState.getterState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskDataState.getterState.error.message}
		/>;
	}

	return <TaskSync
		task={taskDataState.getterState.data}
		setTask={taskDataState.setData}
	/>;
}
