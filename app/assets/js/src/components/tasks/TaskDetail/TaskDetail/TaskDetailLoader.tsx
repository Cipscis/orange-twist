import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils/asyncData';

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

	if (taskDataState.getterState.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (taskDataState.getterState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskDataState.getterState.error.message}
		/>;
	}

	return <TaskDetailSync
		task={taskDataState.getterState.data}
		setTask={taskDataState.setData}
	/>;
}
