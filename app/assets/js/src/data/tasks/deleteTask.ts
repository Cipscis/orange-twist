import { deleteDayTask } from 'data/dayTasks';
import { tasksRegister } from './tasksRegister';

/**
 * Deletes all information associated with a task.
 *
 * @param taskId The string specifying the task to delete.
 */
export function deleteTask(taskId: number): void {
	tasksRegister.delete(taskId);
	deleteDayTask({ taskId });
}
