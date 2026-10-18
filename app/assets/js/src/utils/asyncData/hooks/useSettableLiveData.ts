import {
	useEffect,
	useLayoutEffect,
	useState,
} from 'preact/hooks';

import type { AsyncDataState } from '../AsyncDataState';
import type { SettableAsyncDataState } from '../SettableAsyncDataState';
import type { SettableLiveData } from '../SettableLiveData';

export interface UseSettableLiveDataResult<T> {
	getterState: AsyncDataState<T>;
	setterState: SettableAsyncDataState;
	setData: (data: Partial<T>) => Promise<void>;
}

export function useSettableLiveData<T>(settableLiveData: SettableLiveData<T>): UseSettableLiveDataResult<T> {
	const [getterState, setGetterState] = useState(settableLiveData.getter.state);
	const [setterState, setSetterState] = useState(settableLiveData.setter.state);

	// Construct temporary hybrid state if liveData is updated
	useLayoutEffect(() => {
		setGetterState((state) => ({
			...state,
			loading: settableLiveData.getter.state.loading,
		}));
		setSetterState((state) => ({
			...state,
			loading: settableLiveData.setter.state.loading,
		}));
	}, [settableLiveData]);

	// Add necessary event listeners to update state
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		settableLiveData.getter.addEventListener(
			'loadstart',
			() => setGetterState(settableLiveData.getter.state),
			{ signal },
		);
		settableLiveData.setter.addEventListener(
			'loadstart',
			() => {
				// Set getterState too for optimistic data
				setGetterState(settableLiveData.getter.state);
				setSetterState(settableLiveData.setter.state);
			},
			{ signal },
		);

		settableLiveData.getter.addEventListener(
			'loadend',
			() => setGetterState(settableLiveData.getter.state),
			{ signal },
		);
		settableLiveData.setter.addEventListener(
			'loadend',
			() => setSetterState(settableLiveData.setter.state),
			{ signal },
		);

		return () => controller.abort();
	}, [settableLiveData]);

	// Ensure LiveData stops observing when no longer used/when the component is unmounted
	useEffect(() => {
		return () => settableLiveData[Symbol.dispose]();
	}, [settableLiveData]);

	return {
		getterState: getterState,
		setterState: setterState,
		setData: settableLiveData.setData.bind(settableLiveData),
	};
}
