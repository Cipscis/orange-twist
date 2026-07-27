import { useEffect, useState } from 'preact/hooks';
import type { EnumTypeOf } from './EnumTypeOf';
import type { ExpandType } from './ExpandType';

export const AsyncDataState = {
	LOADING: 'loading',
	ERROR: 'error',
	SUCCESS: 'success',
} as const;
export type AsyncDataState = EnumTypeOf<typeof AsyncDataState>;

type AsyncDataStateMap<T> = {
	[AsyncDataState.LOADING]: {};
	[AsyncDataState.ERROR]: {
		error: Error;
	};
	[AsyncDataState.SUCCESS]: {
		data: T;
	};
};

/**
 * A discriminated union of possible results of async data retrieval.
 */
export type AsyncDataResult<T> = {
	[S in AsyncDataState]: ExpandType<
		{ state: S; } &
		AsyncDataStateMap<T>[S]
	>;
}[AsyncDataState];

export interface GetAsyncDataOptions {
	/**
	 * An `AbortSignal`. If it is aborted, the asynchronous request
	 * for data should also be aborted.
	 */
	signal: AbortSignal;
}

export function useAsyncData<T>(
	getData: (options?: GetAsyncDataOptions) => Promise<T>,
): AsyncDataResult<T> {
	const [result, setResult] = useState<AsyncDataResult<T>>({ state: AsyncDataState.LOADING });

	useEffect(
		() => {
			const controller = new AbortController();
			const { signal } = controller;

			(async () => {
				if (result.state !== AsyncDataState.LOADING) {
					setResult({ state: AsyncDataState.LOADING });
				}

				try {
					const data = await getData({ signal });
					setResult({
						state: AsyncDataState.SUCCESS,
						data,
					});
				} catch (e) {
					const error = (() => {
						if (e instanceof Error) {
							return e;
						} else if (typeof e === 'string') {
							return new Error(e);
						} else {
							return new Error('Encountered unknown error when retrieving async data.', { cause: e });
						}
					})();
					setResult({
						state: AsyncDataState.ERROR,
						error,
					});
				}
			})();

			return () => controller.abort();
		},
		// Only re-run this hook when the `getData` function changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getData]
	);

	return result;
}
