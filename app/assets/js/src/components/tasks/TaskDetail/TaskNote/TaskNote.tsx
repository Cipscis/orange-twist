import { h, type JSX } from 'preact';

import { useSettableTask } from 'database';

import { TaskNoteLoader } from './TaskNoteLoader';

export interface TaskNoteProps {
	taskId: number;
}

export function TaskNote(props: TaskNoteProps): JSX.Element {
	const { taskId } = props;

	const taskDataState = useSettableTask(taskId);

	return <TaskNoteLoader
		taskId={taskId}
		taskDataState={taskDataState}
	/>;
}
