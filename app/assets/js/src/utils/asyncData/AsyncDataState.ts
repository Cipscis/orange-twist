import type { ExpandType } from '../ExpandType';
import type { AsyncDataStateType } from './AsyncDataStateType';

type AsyncDataStateMap<T> = {
	[AsyncDataStateType.INITIAL]: {};
	[AsyncDataStateType.ERROR]: {
		readonly error: Error;
	};
	[AsyncDataStateType.SUCCESS]: {
		readonly data: Readonly<T>;
	};
};

/**
 * A discriminated union of possible results of async data retrieval.
 */
export type AsyncDataState<T> = {
	[S in AsyncDataStateType]: ExpandType<
		{
			readonly type: S;
			readonly loading: boolean;
		} &
		AsyncDataStateMap<T>[S]
	>;
}[AsyncDataStateType];
