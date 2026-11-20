import {
	type GenericEventHandler,
	type JSX,
	h,
	Fragment,
} from 'preact';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'preact/hooks';

import type { Task } from 'database';

import type { TaskLookupProps } from './TaskLookup';

interface TaskLookupSyncProps extends TaskLookupProps {
	tasks: readonly Task[];
}

/**
 * Renders a filterable menu showing a list of provided tasks, providing a callback allowing one to be selected.
 */
export function TaskLookupSync(props: TaskLookupSyncProps): JSX.Element {
	const {
		tasks,

		onSelect,
		filter,
		exactMatch,

		...passthroughProps
	} = props;

	/**
	 * Tasks that pass the current filter, if there is one.
	 */
	const selectableTaskInfo = useMemo(() => {
		if (!filter) {
			return tasks;
		}

		return tasks.filter(filter);
	}, [tasks, filter]);

	const exactMatchTaskInfo = useMemo(() => {
		if (!exactMatch) {
			return null;
		}

		return tasks.find(exactMatch) ?? null;
	}, [tasks, exactMatch]);

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

	/**
	 * Pre-select a task, or clear a pre-selected task if passed `null`.
	 */
	const preselectTask = useCallback((task: Task | null) => {
		const select = selectRef.current;
		if (!select) {
			return;
		}

		if (task) {
			select.value = String(task.id);
		} else {
			select.value = '';
		}

		select.dispatchEvent(new Event('change'));
		valueAutoSelectedRef.current = true;
	}, []);

	// Update the selected option based on filter query changes
	useEffect(() => {
		const select = selectRef.current;
		if (!select) {
			return;
		}

		if (selectableTaskInfo.length === 1) {
			// If there's just one task then select it
			preselectTask(selectableTaskInfo[0]);
		} else if (exactMatchTaskInfo) {
			// If there's a single task that matches the query exactly then select it
			preselectTask(exactMatchTaskInfo);
		} else if (valueAutoSelectedRef.current) {
			// If there's zero or multiple tasks and we'd automatically selected a value, clear it
			preselectTask(null);
		}
	}, [selectableTaskInfo, exactMatchTaskInfo, preselectTask]);

	return <>
		<select
			onChange={onChange}
			class={props.class ?? 'task-lookup'}
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
