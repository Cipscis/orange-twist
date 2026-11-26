import type { ExpandType } from '../ExpandType';
import type { AsyncActionStateType } from './AsyncActionStateType';

type AsyncActionStateMap<T> = {
	[AsyncActionStateType.INITIAL]: {};
	[AsyncActionStateType.ERROR]: {
		readonly error: Error;
	};
	[AsyncActionStateType.SUCCESS]: {
		readonly data: Readonly<T>;
	};
};

/**
 * A discriminated union of possible results of an asynchronous action.
 */
export type AsyncActionState<T> = {
	[S in AsyncActionStateType]: ExpandType<
		{
			readonly type: S;
			readonly loading: boolean;
		} &
		AsyncActionStateMap<T>[S]
	>;
}[AsyncActionStateType];
