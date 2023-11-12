import type { Register } from 'util/register/Register';
import type { dayTasksRegister } from './dayTasksRegister';

// It's fine to use any in extends
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type RegisterKey<R extends Register<any, any>> = R extends Register<infer K, any> ? K : never;

/**
 * Determines the key to use to look up a specified day task.
 *
 * @param dayName The string identifier for a day.
 * @param taskId The unique ID of a task.
 * @returns The key to look up the day task for a given day and task combination in the day tasks register.
 */
export function getDayTaskKey(dayName: string, taskId: number): RegisterKey<typeof dayTasksRegister> {
	return `${dayName}_${taskId}`;
}
