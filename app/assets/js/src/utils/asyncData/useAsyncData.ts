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
