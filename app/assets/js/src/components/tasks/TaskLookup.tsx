import type Preact from 'preact';
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

interface TaskLookupProps extends Omit<
	Preact.SelectHTMLAttributes<HTMLSelectElement>,
	'onSelect'
> {
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
		className,

		...passthroughProps
	} = props;

	const allTaskInfo = useAllTaskInfo();

	/**
	 * Tasks that pass the current filter, if there is one.
	 */
	const selectableTaskInfo = useMemo(() => {
		if (!filter) {
			return allTaskInfo;
		}

		return allTaskInfo.filter(filter);
	}, [allTaskInfo, filter]);

	const selectRef = useRef<HTMLSelectElement>(null);
	/**
	 * A boolean used to keep track if the select's value was auto-selected
	 */
	const valueAutoSelectedRef = useRef<boolean>(false);

	/**
	 * When a change event fires, extract the value of the selected
	 * input and pass it to {@linkcode onSelect}.
	 */
	const onChange: GenericEventHandler<HTMLSelectElement> = useCallback((e) => {
		const select = e.currentTarget;
		if (select.selectedIndex === -1) {
			return;
		}

		// Remember that the user selected an option
		if (e.isTrusted) {
			valueAutoSelectedRef.current = false;
		}

		const selectedOption = select.options[select.selectedIndex];
		const selectedTaskId = Number(selectedOption.value);

		if (isNaN(selectedTaskId)) {
			return;
		}

		onSelect(selectedTaskId);
	}, [onSelect]);

	// Update the selected option based on filter query changes
	useEffect(() => {
		const select = selectRef.current;
		if (!select) {
			return;
		}

		if (selectableTaskInfo.length === 1) {
			// If there's just one task then select it
			select.value = String(selectableTaskInfo[0].id);
			select.dispatchEvent(new Event('change'));
			valueAutoSelectedRef.current = true;
		} else if (valueAutoSelectedRef.current) {
			// If there's zero or multiple tasks and we'd automatically selected a value, clear it
			select.value = '';
			select.dispatchEvent(new Event('change'));
			valueAutoSelectedRef.current = true;
		}
	}, [selectableTaskInfo]);

	return <>
		<select
			onChange={onChange}
			class={className ?? 'task-lookup'}
			ref={selectRef}
			{...passthroughProps}
		>
			<option selected value="">Select a task ({selectableTaskInfo.length} results)</option>
			{selectableTaskInfo.map((task) => (
				<option
					key={task.id}
					value={task.id}
				>{task.name}</option>
			))}
		</select>
	</>;
}
