import { getDayTaskKey } from './getDayTaskKey';
import { dayTasksRegister } from './dayTasksRegister';

export function deleteDayTask(dayName: string, taskId: number): void {
	dayTasksRegister.delete(getDayTaskKey(dayName, taskId));
}
