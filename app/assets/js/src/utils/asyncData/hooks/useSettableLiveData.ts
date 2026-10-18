import {
	useEffect,
	useLayoutEffect,
	useState,
} from 'preact/hooks';

import type { AsyncDataState } from '../AsyncDataState';
import type { SettableAsyncDataState } from '../SettableAsyncDataState';
import type { SettableLiveData } from '../SettableLiveData';

export interface UseSettableLiveDataResult<T> {
	stateOfGet: AsyncDataState<T>;
	stateOfSet: SettableAsyncDataState;
	setData: (data: Partial<T>) => Promise<void>;
}

export function useSettableLiveData<T>(settableLiveData: SettableLiveData<T>): UseSettableLiveDataResult<T> {
	const [stateOfGet, setStateOfGet] = useState(settableLiveData.liveData.state);
	const [stateOfSet, setStateOfSet] = useState(settableLiveData.settableData.state);

	// Construct temporary hybrid state if liveData is updated
	useLayoutEffect(() => {
		setStateOfGet((state) => ({
			...state,
			loading: settableLiveData.liveData.state.loading,
		}));
		setStateOfSet((state) => ({
			...state,
			loading: settableLiveData.settableData.state.loading,
		}));
	}, [settableLiveData]);

	// Add necessary event listeners to update state
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		settableLiveData.liveData.addEventListener(
			'loadstart',
			() => setStateOfGet(settableLiveData.liveData.state),
			{ signal },
		);
		settableLiveData.settableData.addEventListener(
			'loadstart',
			() => {
				// Set stateOfGet too for optimistic data
				setStateOfGet(settableLiveData.liveData.state);
				setStateOfSet(settableLiveData.settableData.state);
			},
			{ signal },
		);

		settableLiveData.liveData.addEventListener(
			'loadend',
			() => setStateOfGet(settableLiveData.liveData.state),
			{ signal },
		);
		settableLiveData.settableData.addEventListener(
			'loadend',
			() => setStateOfSet(settableLiveData.settableData.state),
			{ signal },
		);

		return () => controller.abort();
	}, [settableLiveData]);

	// Ensure LiveData stops observing when no longer used/when the component is unmounted
	useEffect(() => {
		return () => settableLiveData[Symbol.dispose]();
	}, [settableLiveData]);

	return {
		stateOfGet,
		stateOfSet,
		setData: settableLiveData.setData.bind(settableLiveData),
	};
}
