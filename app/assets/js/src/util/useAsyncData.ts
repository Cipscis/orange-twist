import { useEffect, useState } from 'preact/hooks';

export interface AsyncDataState<T> {
	data: T | null;
	isLoading: boolean;
	error: string | null;
}

interface GetAsyncDataOptions {
	/**
	 * An `AbortSignal`. If it is aborted, the asynchronous request
	 * for data should also be aborted.
	 */
	signal?: AbortSignal;
}

export function useAsyncData<T>(
	getData: (options?: GetAsyncDataOptions) => Promise<T>,
): AsyncDataState<T> {
	const [isLoading, setIsLoading] = useState(true);
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		(async () => {
			setIsLoading(true);
			setError(null);

			try {
				const data = await getData({ signal });
				setData(data);
			} catch (e) {
				setData(null);

				const error = (() => {
					if (e instanceof Error) {
						return e.message;
					} else if (typeof e === 'string') {
						return e;
					} else {
						return String(e);
					}
				})();
				setError(error);
			 } finally {
				setIsLoading(false);
			}
		})();

		return () => controller.abort();
	}, [getData]);

	return {
		isLoading,
		data,
		error,
	};
}
