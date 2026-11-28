import { h, type JSX } from 'preact';
import type { AsyncAction } from '../../utils/asyncAction/AsyncAction';
import { useAsyncAction } from '../../utils/asyncAction/hooks';

export interface ActionProgressProps<T, A extends unknown[]> {
	action: AsyncAction<T, A>;
}

export function ActionProgress<T, A extends unknown[]>(props: ActionProgressProps<T, A>): JSX.Element | null {
	const {
		action,
	} = props;

	const state = useAsyncAction(action);

	return state.progress === null
		? null
		: <progress
			max={1}
			value={state.progress}
		/>;
}
