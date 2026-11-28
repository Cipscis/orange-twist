/**
 * Measure the performance of an asynchronous function.
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
	if (__IS_DEV__) {
		performance.mark(`${name} start`);
	}
	const result = await fn();
	if (__IS_DEV__) {
		performance.mark(`${name} end`);
		performance.measure(name, `${name} start`, `${name} end`);
	}
	return result;
}
