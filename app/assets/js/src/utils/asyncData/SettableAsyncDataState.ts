import type { ExpandType } from '../ExpandType';
import type { AsyncActionStateType } from './AsyncActionStateType';

type SettableAsyncDataStateMap = {
	[AsyncActionStateType.INITIAL]: {};
	[AsyncActionStateType.ERROR]: {
		error: Error;
	};
	[AsyncActionStateType.SUCCESS]: {};
};

export type SettableAsyncDataState = {
	[S in AsyncActionStateType]: ExpandType<
		{
			type: S;
			loading: boolean;
		} &
		SettableAsyncDataStateMap[S]
	>;
}[AsyncActionStateType];
