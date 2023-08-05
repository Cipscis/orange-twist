import { useEffect, useState } from 'preact/hooks';

export interface AsyncDataState<T> {
	data: T | null;
	isLoading: boolean;
	error: string | null;
}

export function useAsyncData<T>(
	getData: () => Promise<T>,
): AsyncDataState<T> {
	const [isLoading, setIsLoading] = useState(true);
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setError(null);

			try {
				const data = await getData();
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

		// TODO: Abort fetch on cleanup
	}, [getData]);

	return {
		isLoading,
		data,
		error,
	};
}
