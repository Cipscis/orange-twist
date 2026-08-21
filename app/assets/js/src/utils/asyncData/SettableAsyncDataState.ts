import type { ExpandType } from '../ExpandType';
import type { AsyncDataStateType } from './AsyncDataStateType';

export type SettableDataStateType = Exclude<
	AsyncDataStateType,
	typeof AsyncDataStateType.ABORTED
>;

type SettableAsyncDataStateMap = {
	[AsyncDataStateType.INITIAL]: {};
	[AsyncDataStateType.ERROR]: {
		error: Error;
	};
	[AsyncDataStateType.SUCCESS]: {};
};

export type SettableAsyncDataState = {
	[S in SettableDataStateType]: ExpandType<
		{
			type: S;
			loading: boolean;
		} &
		SettableAsyncDataStateMap[S]
	>;
}[SettableDataStateType];
