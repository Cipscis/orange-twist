import {
	useEffect,
	useLayoutEffect,
	useState,
} from 'preact/hooks';

import type { AsyncActionState } from '../AsyncActionState';
import type { AsyncAction } from '../AsyncAction';

/**
 * Provides a live {@linkcode AsyncActionState}.
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
 * const state = useAsyncAction(liveData);
 * ```
 */
export function useAsyncAction<T, A extends unknown[] = []>(action: AsyncAction<T, A>): AsyncActionState<T> {
	const [state, setState] = useState(action.state);

	// Construct temporary hybrid state if liveData is updated
	useLayoutEffect(() => {
		setState((state) => ({
			...state,
			loading: action.state.loading,
		}));
	}, [action]);

	// Add necessary event listeners to update state
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		action.addEventListener(
			'loadstart',
			() => setState(action.state),
			{ signal },
		);

		action.addEventListener(
			'progress',
			() => setState(action.state),
			{ signal },
		);

		action.addEventListener(
			'loadend',
			() => setState(action.state),
			{ signal },
		);

		return () => controller.abort();
	}, [action]);

	// Ensure LiveData stops observing when no longer used/when the component is unmounted
	useEffect(() => {
		return () => action[Symbol.dispose]();
	}, [action]);

	return state;
}
