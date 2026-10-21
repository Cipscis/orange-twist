/**
 * Debounce a function so it will actually be called once after next processing the microtask queue, if called multiple times synchronously.
 */
export function microDebounce<
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

		queueMicrotask(() => {
			fn.apply(this, args);
			callingBlocked = false;
		});
	};
}
