import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import type {
	Task,
	useSettableStatusForTask,
} from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { TaskStatusPickerSync } from './TaskStatusPickerSync';

export interface TaskStatusPickerLoaderProps {
	taskDataState: AsyncDataState<Task>;
	taskStatusDataState: ReturnType<typeof useSettableStatusForTask>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving day task information. If day task information is loaded, uses it to render a status picker for that day task.
 */
export function TaskStatusPickerLoader(props: TaskStatusPickerLoaderProps): JSX.Element {
	const {
		taskDataState,
		taskStatusDataState,
	} = props;

	if (
		taskDataState.type === AsyncDataStateType.INITIAL ||
		taskStatusDataState.stateOfGet.type === AsyncDataStateType.INITIAL
	) {
		return <Loader />;
	}

	if (taskDataState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskDataState.error.message}
		/>;
	} else if (taskStatusDataState.stateOfGet.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskStatusDataState.stateOfGet.error.message}
		/>;
	}

	return <TaskStatusPickerSync
		task={taskDataState.data}
		status={taskStatusDataState.stateOfGet.data}
		setStatus={taskStatusDataState.setData}
	/>;
}
