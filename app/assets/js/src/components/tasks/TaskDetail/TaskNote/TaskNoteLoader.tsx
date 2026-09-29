import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils';

import type { useSettableTask } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import type { TaskNoteProps } from './TaskNote';
import { TaskNoteSync } from './TaskNoteSync';

interface TaskNoteLoaderProps extends TaskNoteProps {
	taskDataState: ReturnType<typeof useSettableTask>;
}

export function TaskNoteLoader(props: TaskNoteLoaderProps): JSX.Element {
	const {
		taskId,
		taskDataState,
	} = props;

	// Don't display a loading state while setting or re-retrieving data
	const isLoading = taskDataState.stateOfGet.type === AsyncDataStateType.INITIAL;

	if (isLoading) {
		return <Loader />;
	}

	if (
		taskDataState.stateOfGet.type === AsyncDataStateType.SUCCESS &&
		taskDataState.stateOfGet.data
	) {
		return <TaskNoteSync
			task={taskDataState.stateOfGet.data}
			setData={taskDataState.setData}
		/>;
	}

	return <Notice
		message={`Could not load note for task with ID ${taskId}`}
		variant={NoticeVariant.ERROR}
	/>;
}
