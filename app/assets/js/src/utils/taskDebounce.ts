import { queueMacrotask } from './queueMacrotask';

/**
 * Debounce a function so it will actually be called once after the end of the current task, if called multiple times within the same task.
 */
export function taskDebounce<
	T extends (...args: any[]) => unknown
>(fn: T): (
	this: ThisParameterType<T>,
	...args: Parameters<T>
) => void {
	let callingBlocked = false;

	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		if (callingBlocked) {
			return;
		}
		callingBlocked = true;

		queueMacrotask(() => {
			fn.apply(this, args);
			callingBlocked = false;
		});
	};
}
