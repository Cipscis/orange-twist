export function getPromiseWithResolver<T>(): [
	Promise<T>,
	(value: T | PromiseLike<T>) => void
] {
	let resolve: ((value: T | PromiseLike<T>) => void) | undefined = undefined;

	const promise = new Promise<T>(
		(resolveFn) => resolve = resolveFn
	);

	if (!resolve) {
		throw new Error('Resolve function was not set');
	}

	return [promise, resolve];
}
