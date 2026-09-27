import type { ExpandType } from '../ExpandType';
import type { AsyncDataStateType } from './AsyncDataStateType';

type SettableAsyncDataStateMap = {
	[AsyncDataStateType.INITIAL]: {};
	[AsyncDataStateType.ERROR]: {
		error: Error;
	};
	[AsyncDataStateType.SUCCESS]: {};
};

export type SettableAsyncDataState = {
	[S in AsyncDataStateType]: ExpandType<
		{
			type: S;
			loading: boolean;
		} &
		SettableAsyncDataStateMap[S]
	>;
}[AsyncDataStateType];
