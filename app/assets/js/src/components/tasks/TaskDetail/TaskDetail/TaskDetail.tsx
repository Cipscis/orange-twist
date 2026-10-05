import { h, type JSX } from 'preact';

import { useSettableTask } from 'database';

import { TaskDetailLoader } from './TaskDetailLoader';

export interface TaskDetailProps {
	taskId: number;
}

/**
 * Asynchronously retrieves information about a task and passes it on to render a detailed view of that task, including its notes, once loaded.
 */
export function TaskDetail(props: TaskDetailProps): JSX.Element {
	const {
		taskId,
	} = props;

	const taskDataState = useSettableTask(taskId);

	return <TaskDetailLoader
		taskDataState={taskDataState}
	/>;
}
