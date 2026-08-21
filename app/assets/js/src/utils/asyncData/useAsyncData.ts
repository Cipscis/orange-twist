import {
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import { extractError } from './extractError';
import { AsyncDataStateType } from './AsyncDataStateType';
import type { AsyncDataState } from './AsyncDataState';

export type AsyncDataResult<T> = {
	/** The current state of the async data. */
	state: AsyncDataState<T>;
	/**
	 * A getter function to retrieve async data.
	 *
	 * @param options An optional set of configuration options.
	 *
	 * @throws Error if an error is encountered when retrieving data.
	 */
	getData: (options?: GetAsyncDataOptions) => Promise<T>;
};

export interface GetAsyncDataOptions {
	/**
	 * An `AbortSignal`. If it is aborted, the asynchronous request
	 * for data should also be aborted.
	 */
	signal: AbortSignal;
}

/**
 * Provides a getter function for asynchronous data, as well as an automatically updated state object that can be used to handle states like loading and error.
 *
 * @param getData A function that retrieves data asynchronously. Will be passed an {@linkcode AbortSignal} that will be aborted if a subsequent request is made, or if an external {@linkcode AbortSignal} provided to the returned getter is aborted.
 */
export function useAsyncData<T>(
	getData: (options: GetAsyncDataOptions) => Promise<T>,
): AsyncDataResult<T> {
	const [state, setState] = useState<AsyncDataState<T>>({
		type: AsyncDataStateType.INITIAL,
		loading: false,
	});

	const abortControllerRef = useRef(new AbortController());

	/**
	 * Abort any previous data requests, and reset the internal {@linkcode AbortController}.
	 */
	const abortPrevious = useCallback(() => {
		abortControllerRef.current.abort();
		abortControllerRef.current = new AbortController();
	}, []);

	/**
	 * Construct a combined {@linkcode AbortSignal} from both internal sources and optional external sources passed in as options.
	 */
	const getCombinedAbortSignal = useCallback((options?: GetAsyncDataOptions) => {
		const internalSignal = abortControllerRef.current.signal;
		const externalSignal = options?.signal;

		const combinedSignal = AbortSignal.any([
			internalSignal,
			externalSignal,
		].filter(Boolean));

		return combinedSignal;
	}, []);

	/**
	 * A wrapper around the {@linkcode getData} function that manages custom logic such as setting state and sending internal {@linkcode AbortSignal}s.
	 */
	const getDataWrapper = useCallback(
		async (options?: GetAsyncDataOptions) => {
			// 1. Abort any previous attempts, and configure abort controls for this attempt
			abortPrevious();
			const combinedAbortSignal = getCombinedAbortSignal(options);

			// Add abort listeners to enter aborted state if signal is aborted before we reach success or error state
			const abortSignalUpdateController = new AbortController();
			const abortSignalUpdateSignal = abortSignalUpdateController.signal;

			combinedAbortSignal.addEventListener(
				'abort',
				() => {
					setState({
						type: AsyncDataStateType.ABORTED,
						loading: false,
						reason: combinedAbortSignal.reason,
					});
				},
				{
					signal: abortSignalUpdateSignal,
				}
			);

			try {
				// 2. Enter loading state
				if (!state.loading) {
					setState((state) => ({
						...state,
						loading: true,
					}));
				}

				// 3. Attempt to retrieve data
				const data = await getData({
					signal: combinedAbortSignal,
				});
				// 4a. Handle retrieved data
				setState({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data,
				});
				return data;
			} catch (e) {
				// 4b. Handle error retrieving data
				const error = extractError(e, 'Encountered unknown error when retrieving async data.');
				setState({
					type: AsyncDataStateType.ERROR,
					loading: false,
					error,
				});
				throw error;
			} finally {
				abortSignalUpdateController.abort();
			}
		},
		// Deliberately only rebuild this function when the `getData` function changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[getData]
	);

	const result = useMemo<AsyncDataResult<T>>(() => ({
		state,
		getData: getDataWrapper,
	}), [state, getDataWrapper]);

	return result;
}
