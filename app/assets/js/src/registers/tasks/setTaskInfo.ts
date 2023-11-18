import type { TaskInfo } from './types';

import { getCurrentDateDayName } from 'util/index';

import { tasksRegister } from './tasksRegister';
import { TaskStatus } from 'types/TaskStatus';
import { getDayTaskInfo, setDayTaskInfo } from 'registers/dayTasks';

const defaultTaskInfo = {
	name: 'New task',
	status: TaskStatus.TODO,
} as const satisfies Omit<TaskInfo, 'id'>;

/**
 * Updates the specified task with the provided information. If the task
 * has no information already, the blanks will be filled in with defaults.
 *
 * @param taskId The unique ID specifying the task to update.
 * @param taskInfo The new information to set of the specified task.
 */
export function setTaskInfo(
	taskId: number,
	taskInfo: Partial<Omit<TaskInfo, 'id'>>
): void {
	const existingTaskInfo = tasksRegister.get(taskId);
	tasksRegister.set(taskId, {
		id: taskId,

		name: taskInfo.name ?? existingTaskInfo?.name ?? defaultTaskInfo.name,
		status: taskInfo.status ?? existingTaskInfo?.status ?? defaultTaskInfo.status,
	});

	if (taskInfo.status) {
		const dayName = getCurrentDateDayName();
		if (getDayTaskInfo({ dayName, taskId })?.status !== taskInfo.status) {
			setDayTaskInfo({ dayName, taskId }, { status: taskInfo.status });
		}
	}
}
