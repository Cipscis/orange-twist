import {
	type GenericEventHandler,
	type JSX,
	h,
} from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

import { useAllTaskInfo, type TaskInfo } from 'data';

interface TaskLookupProps {
	/**
	 * A callback called when a task is selected.
	 */
	onSelect: (this: void, taskId: number) => void;

	/**
	 * An array filter predicate function used to show only a subset of tasks.
	 *
	 * @see {@linkcode Array.prototype.filter}
	 */
	filter?: (
		this: void,
		task: TaskInfo,
		index: number,
		array: readonly TaskInfo[],
	) => boolean;
}

/**
 * A component that renders a menu showing a list of all tasks,
 * providing a callback allowing one to be selected.
 */
export function TaskLookup(props: TaskLookupProps): JSX.Element {
	const {
		onSelect,
		filter,
	} = props;

	const allTaskInfo = useAllTaskInfo();

	const selectableTaskInfo = useMemo(() => {
		if (!filter) {
			return allTaskInfo;
		}

		return allTaskInfo.filter(filter);
	}, [allTaskInfo, filter]);

	/**
	 * When a change event fires, extract the value of the selected
	 * input and pass it to {@linkcode onSelect}.
	 */
	const onChange: GenericEventHandler<HTMLSelectElement> = useCallback((e) => {
		const select = e.currentTarget;
		if (select.selectedIndex === -1) {
			return;
		}

		const selectedOption = select.options[select.selectedIndex];
		const selectedTaskId = Number(selectedOption.value);

		if (isNaN(selectedTaskId)) {
			return;
		}

		onSelect(Number(selectedOption.value));
	}, [onSelect]);

	return <>
		<select
			onChange={onChange}
			class="task-lookup"
		>
			<option selected disabled value="">Select a task</option>
			{selectableTaskInfo.map((task) => (
				<option
					key={task.id}
					value={task.id}
				>{task.name}</option>
			))}
		</select>
	</>;
}
