/**
 * Measure the performance of a synchronous function.
 */
export function measureSync<T>(name: string, fn: () => T): T {
	if (__IS_DEV__) {
		performance.mark(`${name} start`);
	}
	const result = fn();
	if (__IS_DEV__) {
		performance.mark(`${name} end`);
		performance.measure(name, `${name} start`, `${name} end`);
	}
	return result;
}
