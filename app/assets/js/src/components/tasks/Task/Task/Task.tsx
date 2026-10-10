import { h, type JSX } from 'preact';

import { useSettableTask } from 'database';

import { TaskLoader } from './TaskLoader';

interface TaskProps {
	taskId: number;
}

/**
 * Asynchronously retrieves information about a task and passes it on to render that task once loaded.
 */
export const Task = (props: TaskProps): JSX.Element => {
	const {
		taskId,
	} = props;

	const taskDataState = useSettableTask(taskId);

	return <TaskLoader
		taskDataState={taskDataState}
	/>;
};
