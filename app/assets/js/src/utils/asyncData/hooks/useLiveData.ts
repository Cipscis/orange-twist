import {
	useEffect,
	useLayoutEffect,
	useState,
} from 'preact/hooks';

import type { AsyncDataState } from '../AsyncDataState';
import type { LiveData } from '../LiveData';

/**
 * Provides a live {@linkcode AsyncDataState} that begins loading immediately.
 *
 * @example
 * ```ts
 * const liveData = useMemo(() => {
 *     const liveData = new LiveData(options);
 *     // Begin loading data and watching for changes immediately
 *     liveData.observe();
 *     return liveData;
 * }, [options]);
 *
 * const state = useLiveData(liveData);
 * ```
 */
export function useLiveData<T>(liveData: LiveData<T>): AsyncDataState<T> {
	const [state, setState] = useState(liveData.state);

	// Construct temporary hybrid state if liveData is updated
	useLayoutEffect(() => {
		setState((state) => ({
			...state,
			loading: liveData.state.loading,
		}));
	}, [liveData]);

	// Add necessary event listeners to update state
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		liveData.addEventListener(
			'loadstart',
			() => setState(liveData.state),
			{ signal },
		);

		liveData.addEventListener(
			'loadend',
			() => setState(liveData.state),
			{ signal },
		);

		return () => controller.abort();
	}, [liveData]);

	// Ensure LiveData stops observing when no longer used/when the component is unmounted
	useEffect(() => {
		return () => liveData[Symbol.dispose]();
	}, [liveData]);

	return state;
}
