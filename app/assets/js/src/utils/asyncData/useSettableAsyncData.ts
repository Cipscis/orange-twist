import {
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import type { ExpandType } from '../ExpandType';
import type { DefaultsFor } from '../DefaultsFor';

import { AsyncDataStateType } from './AsyncDataStateType';
import { extractError } from './extractError';

import {
	useAsyncData,
	type AsyncDataResult,
	type GetAsyncDataOptions,
} from './useAsyncData';

import type { SettableAsyncDataState } from './SettableAsyncDataState';

export interface UseSettableAsyncDataOptions<T> {
	/**
	 * A function that retrieves data asynchronously. Will be passed an {@linkcode AbortSignal} that will be aborted if a subsequent request is made, or if an external {@linkcode AbortSignal} provided to the returned getter is aborted.
	 */
	getData: (options: GetAsyncDataOptions) => Promise<T | null>;
	/**
	 * A function that sets data via partial update.
	 */
	setData: (data: Partial<T>) => Promise<void>;
	/**
	 * If set, provide an "optimistic" value after calling {@linkcode SettableAsyncDataResult.setData setData}. This allows the new value to be displayed immediately during the gap between setting it and retrieving it again.
	 *
	 * @default false
	 */
	optimistic?: boolean;
}
const useSettableAsyncDataDefaultOptions = {
	optimistic: false,
} as const satisfies DefaultsFor<
	UseSettableAsyncDataOptions<unknown>
>;

export type SettableAsyncDataResult<T> = ExpandType<
	Omit<AsyncDataResult<T | null>, 'state'> &
	{
		stateOfGet: AsyncDataResult<T | null>['state'];

		setData: (data: Partial<T>) => Promise<void>;
		stateOfSet: SettableAsyncDataState;
	}
>;

/**
 * Provides a getter and a setter function for asynchronous data, as well as an automatically updated pair of state objects that can be used to handle states like loading and error of both get and set operations.
 *
 * @param options @see {@linkcode UseSettableAsyncDataOptions}
 */
export function useSettableAsyncData<T>(
	options: UseSettableAsyncDataOptions<T>
): SettableAsyncDataResult<T> {
	const {
		getData,
		setData,
		optimistic,
	} = {
		...useSettableAsyncDataDefaultOptions,
		...options,
	};

	const {
		getData: getDataWrapper,
		state: stateOfGet,
	} = useAsyncData(getData);

	const [stateOfSet, setStateOfSet] = useState<SettableAsyncDataState>({
		type: AsyncDataStateType.INITIAL,
		loading: false,
	});

	const optimisticDataRef = useRef(
		stateOfGet.type === AsyncDataStateType.SUCCESS
			? stateOfGet.data
			: null
	);

	const setDataWrapper = useCallback(async (data: Partial<T>) => {
		const setDataPromise = setData(data);

		setStateOfSet((stateSet) => ({
			...stateSet,
			loading: true,
		}));

		if (optimistic) {
			const baseData = optimisticDataRef.current ?? (stateOfGet.type === 'success' ? stateOfGet.data : null);

			if (baseData !== null) {
				optimisticDataRef.current = {
					...baseData,
					...data,
				};
			}
		}

		try {
			await setDataPromise;
			setStateOfSet({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			});
		} catch (e) {
			const error = extractError(e, 'Encountered unknown error when setting async data.');
			setStateOfSet({
				type: AsyncDataStateType.ERROR,
				loading: false,
				error,
			});
		}
	}, [stateOfGet, optimistic, setData]);

	const stateCombined = useMemo(() => {
		const proxyStateOfGet = structuredClone(stateOfGet);

		// Use options to determine if there should be some optimistic state
		if (
			optimistic &&
			optimisticDataRef.current &&
			proxyStateOfGet.type === AsyncDataStateType.SUCCESS
		) {
			proxyStateOfGet.data = optimisticDataRef.current;
		}

		const settableState = {
			getData: getDataWrapper,
			setData: setDataWrapper,
			stateOfGet: proxyStateOfGet,
			stateOfSet,
		};
		return settableState;
	}, [
		optimistic,
		optimisticDataRef,
		getDataWrapper,
		setDataWrapper,
		stateOfGet,
		stateOfSet,
	]);

	return stateCombined;
}
