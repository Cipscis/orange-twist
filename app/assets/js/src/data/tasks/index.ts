export type { TaskInfo } from './types';

export { createTask } from './createTask';
export { setTaskInfo } from './setTaskInfo';
export { deleteTask } from './deleteTask';
export { deleteAllTasks } from './deleteAllTasks';
export { getTaskInfo } from './getTaskInfo';
export { getAllTaskInfo } from './getAllTaskInfo';

export {
	useTaskInfo,
	useAllTaskInfo,
} from './hooks';

export {
	loadTasks,
	saveTasks,
} from './persistence';
