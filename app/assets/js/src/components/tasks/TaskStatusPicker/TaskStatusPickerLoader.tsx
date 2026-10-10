import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import type {
	DayTask,
	Task,
	useSettableTask,
} from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { TaskStatusPickerSync } from './TaskStatusPickerSync';

export interface TaskStatusPickerLoaderProps {
	taskDataState: AsyncDataState<Task>;
	currentDayTaskDataState: AsyncDataState<DayTask>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving day task information. If day task information is loaded, uses it to render a status picker for that day task.
 */
export function TaskStatusPickerLoader(props: TaskStatusPickerLoaderProps): JSX.Element {
	const {
		taskDataState,
		currentDayTaskDataState,
	} = props;

	if (
		taskDataState.type === AsyncDataStateType.INITIAL ||
		currentDayTaskDataState.type === AsyncDataStateType.INITIAL
	) {
		return <Loader />;
	}

	if (taskDataState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskDataState.error.message}
		/>;
	} else if (currentDayTaskDataState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={currentDayTaskDataState.error.message}
		/>;
	}

	return <TaskStatusPickerSync
		task={taskDataState.data}
		status={currentDayTaskDataState.data.status}
	/>;
}
