import type { ExpandType } from '../ExpandType';
import type { AsyncDataStateType } from './AsyncDataStateType';

type AsyncDataStateMap<T> = {
	[AsyncDataStateType.INITIAL]: {};
	[AsyncDataStateType.ABORTED]: {
		reason: unknown;
	};
	[AsyncDataStateType.ERROR]: {
		error: Error;
	};
	[AsyncDataStateType.SUCCESS]: {
		data: T;
	};
};

/**
 * A discriminated union of possible results of async data retrieval.
 */
export type AsyncDataState<T> = {
	[S in AsyncDataStateType]: ExpandType<
		{
			type: S;
			loading: boolean;
		} &
		AsyncDataStateMap<T>[S]
	>;
}[AsyncDataStateType];
