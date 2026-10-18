import type { ExpandType } from '../ExpandType';
import type { AsyncDataResult} from './useAsyncData';

import type { SettableAsyncDataState } from './SettableAsyncDataState';

export type SettableAsyncDataResult<T> = ExpandType<
	Omit<AsyncDataResult<T>, 'state'> &
	{
		stateOfGet: AsyncDataResult<T>['state'];

		setData: (data: Partial<T>) => Promise<void>;
		stateOfSet: SettableAsyncDataState;
	}
>;
