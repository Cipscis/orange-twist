import type Preact from 'preact';
import { h, type JSX } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import { useCompletedTaskIds } from 'database';

import { Accordion } from 'components/shared';

import type { TaskList } from './TaskList';
import { TaskListLoader } from './TaskListLoader';

interface CompletedTaskListProps {
	open?: boolean;
}

/**
 * Renders a {@linkcode TaskList} of all completed tasks inside a disclosure.
 */
export function CompletedTaskList(props: CompletedTaskListProps): JSX.Element | null {
	const completedTaskIdsState  = useCompletedTaskIds();

	const [listOpen, setListOpen] = useState(props.open ?? false);

	const onListToggle = useCallback((event: Preact.TargetedEvent<HTMLDetailsElement, Event>) => {
		setListOpen(event.currentTarget.open);
	}, []);

	return <Accordion
		class="orange-twist__section"
		summary={
			<h2 class="orange-twist__title">Completed tasks</h2>
		}
		onToggle={onListToggle}
		open={listOpen}
	>
		<TaskListLoader
			taskIdsDataState={completedTaskIdsState}
		/>
	</Accordion>;
}
