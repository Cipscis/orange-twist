import { h, type JSX } from 'preact';

import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncAction';

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
	taskDataState: AsyncActionState<Task>;
	taskStatusDataState: ReturnType<typeof useSettableStatusForTask>;
	deleteTask: () => Promise<void>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving task information. If task information is loaded, uses it to render a status picker for that task.
 */
export function TaskStatusPickerLoader(props: TaskStatusPickerLoaderProps): JSX.Element {
	const {
		taskDataState,
		taskStatusDataState,
		deleteTask,
	} = props;

	if (
		taskDataState.type === AsyncActionStateType.INITIAL ||
		taskStatusDataState.getterState.type === AsyncActionStateType.INITIAL
	) {
		return <Loader />;
	}

	if (taskDataState.type === AsyncActionStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskDataState.error.message}
		/>;
	} else if (taskStatusDataState.getterState.type === AsyncActionStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={taskStatusDataState.getterState.error.message}
		/>;
	}

	return <TaskStatusPickerSync
		status={taskStatusDataState.getterState.data}
		setStatus={taskStatusDataState.setData}
		deleteTask={deleteTask}
	/>;
}
