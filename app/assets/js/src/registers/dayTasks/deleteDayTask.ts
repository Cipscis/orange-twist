import { encodeDayTaskKey } from './util';
import { dayTasksRegister } from './dayTasksRegister';
import type { DayTaskIdentifier } from './types/DayTaskIdentifier';

export function deleteDayTask({ dayName, taskId }: DayTaskIdentifier): void {
	dayTasksRegister.delete(encodeDayTaskKey({ dayName, taskId }));
}
