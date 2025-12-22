import {
	type GenericEventHandler,
	type JSX,
	h,
} from 'preact';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'preact/hooks';

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

	/** An optional CSS class to apply to the select. */
	class?: string;
}

/**
 * A component that renders a menu showing a list of all tasks,
 * providing a callback allowing one to be selected.
 */
export function TaskLookup(props: TaskLookupProps): JSX.Element {
	const {
		onSelect,
		filter,
		class: className,
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

		onSelect(selectedTaskId);
	}, [onSelect]);

	const selectRef = useRef<HTMLSelectElement>(null);

	// When the filtered task list changes, if there's just one task then select it
	useEffect(() => {
		const select = selectRef.current;
		if (!select) {
			return;
		}

		if (selectableTaskInfo.length === 1) {
			select.value = String(selectableTaskInfo[0].id);
		}
	}, [selectableTaskInfo]);

	return <>
		<select
			onChange={onChange}
			class={className ?? 'task-lookup'}
			ref={selectRef}
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
