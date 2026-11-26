import { type JSX, h } from 'preact';

import type { Task } from 'database';
import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncData';

import { Notice, NoticeVariant } from 'components/shared';

import type { TaskLookupProps } from './TaskLookup';
import { TaskLookupSync } from './TaskLookupSync';

interface TaskLookupLoaderProps extends TaskLookupProps {
	tasksDataState: AsyncActionState<readonly Task[]>;
}

/**
 * Renders an asynchronously loading {@linkcode TaskLookupSync} component, handling loading and error state.
 */
export function TaskLookupLoader(props: TaskLookupLoaderProps): JSX.Element {
	const {
		tasksDataState,
		...passthroughProps
	} = props;

	if (tasksDataState.type === AsyncActionStateType.INITIAL) {
		return <select
			class={props.class ?? 'task-lookup'}
			disabled
		>
			<option disabled selected>Loading</option>
		</select>;
	}

	if (tasksDataState.type === AsyncActionStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={tasksDataState.error.message}
		/>;
	}

	return <TaskLookupSync
		{...passthroughProps}
		tasks={tasksDataState.data}
	/>;
}
