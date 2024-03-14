import { h, type JSX } from 'preact';
import {
	useCallback,
	useId,
	useMemo,
	useRef,
} from 'preact/hooks';

import { classNames } from 'utils';

import { useViewTransition } from 'utils';

import { useAllTaskInfo, type TaskInfo } from 'data';

import { Task } from './Task';

interface TaskListProps {
	/**
	 * Either an array of task IDs, or a function that determines
	 * whether or not a task should be displayed.
	 */
	matcher: readonly number[] | ((task: TaskInfo) => boolean);
	/**
	 * A function to be used to determine the sorting order of tasks.
	 * If ommitted, tasks will be sorted by their `sortIndex`.
	 *
	 * Ignored if `matcher` is an array of task IDs.
	 */
	sorter?: ((taskA: TaskInfo, TaskB: TaskInfo) => number);
	dayName?: string;
	className?: string;

	onReorder?: (taskIds: readonly number[]) => void;
}

/**
 * Renders a list of specified tasks, which can be
 * reordered via drag & drop.
 */
export function TaskList(
	props: TaskListProps,
): JSX.Element {
	const {
		matcher,
		sorter,
		dayName,
		className,

		onReorder,
	} = props;

	const tasksInfoUnsorted = useAllTaskInfo(matcher);

	/**
	 * Instructions on how tasks should be sorted, if necessary.
	 */
	const sortTasks = useMemo(() => {
		// If passed an array of task IDs, sort based on that array
		if (Array.isArray(matcher)) {
			return (
				{ id: idA }: TaskInfo,
				{ id: idB }: TaskInfo
			) => {
				return matcher.indexOf(idA) - matcher.indexOf(idB);
			};
		}

		// If there is a sorter function, use that
		if (sorter) {
			return sorter;
		}

		// Otherwise, sort by sortIndex
		return (
			{ sortIndex: indexA }: TaskInfo,
			{ sortIndex: indexB }: TaskInfo
		) => {
			return indexA - indexB;
		};
	}, [matcher, sorter]);

	// Sort task info if necessary
	const tasksInfo = useMemo(() => {
		if (sortTasks) {
			return tasksInfoUnsorted.toSorted(sortTasks);
		}

		return tasksInfoUnsorted;
	}, [tasksInfoUnsorted, sortTasks]);

	const idBase = useId();

	const itemsRef = useRef<Array<HTMLDivElement | null>>([]);
	const isInDraggingMode = useRef(false);

	const {
		startViewTransition,
		isInViewTransition,
	} = useViewTransition();

	/**
	 * Set up the metadata for a drag.
	 */
	const dragStartHandler = useCallback((e: DragEvent) => {
		const target = e.currentTarget;
		if (!(target instanceof Element)) {
			return;
		}
		const itemEl = target.parentElement;

		const dataTransfer = e.dataTransfer;
		if (!(itemEl && dataTransfer)) {
			return;
		}

		isInDraggingMode.current = true;

		dataTransfer.dropEffect = 'move';
		dataTransfer.setDragImage(itemEl, 0, 0);
		dataTransfer.clearData();
		dataTransfer.setData('text/plain', itemEl.id);
	}, []);

	/**
	 * Detect if an item is being dragged over a valid drop target,
	 * and allow drop events if so.
	 */
	const dragOverHandler = useCallback((e: DragEvent) => {
		if (!(e.target instanceof Element)) {
			return;
		}

		if (!isInDraggingMode.current) {
			return;
		}

		const dropTarget = e.target.closest('[data-task-list-drop-target]');
		if (dropTarget) {
			// Prevent the default "drag over" action to allow drop events
			e.preventDefault();
		}
	}, []);

	/**
	 * Handle moving an element when dropped, and emiting an event.
	 */
	const dropHandler = useCallback((e: DragEvent) => {
		if (!(
			onReorder &&
			(e.target instanceof Element) &&
			e.dataTransfer
		)) {
			return;
		}

		const dropTarget = e.target.closest('[data-task-list-drop-target]');
		const dropData = e.dataTransfer.getData('text/plain');
		const draggedElement = document.getElementById(dropData);

		if (!(
			(dropTarget instanceof HTMLElement) &&
			draggedElement
		)) {
			return;
		}

		isInDraggingMode.current = false;

		// Construct a new order of tasks to send to `onReorder`
		const newTasksOrder = itemsRef.current
			// First, remove null entries
			.filter(Boolean)
			// Then, map to ID
			.map(
				(element) => {
					return Number(element.dataset.taskListItemId);
				}
			);

		// Determine the positions of the dragged element and drop targe
		// to determine where to move the dragged element from and to
		const dropTargetIndex = newTasksOrder.indexOf(
			Number(dropTarget.dataset.taskListItemId)
		);
		const draggedElementIndex = newTasksOrder.indexOf(
			Number(draggedElement.dataset.taskListItemId)
		);

		// Move the dragged element to its new position in the array
		if (dropTarget.compareDocumentPosition(draggedElement) === Node.DOCUMENT_POSITION_FOLLOWING) {
			// Put the dragged element before the drop target
			newTasksOrder.splice(draggedElementIndex, 1);
			newTasksOrder.splice(dropTargetIndex, 0, Number(draggedElement.dataset.taskListItemId));
		} else {
			// Put the dragged element after the drop target
			newTasksOrder.splice(dropTargetIndex + 1, 0, Number(draggedElement.dataset.taskListItemId));
			newTasksOrder.splice(draggedElementIndex, 1);
		}

		startViewTransition(() => onReorder(newTasksOrder));
	}, [startViewTransition, onReorder]);

	return <div
		class={classNames('task-list', className)}
		onDragOver={dragOverHandler}
		onDrop={dropHandler}
	>
		{tasksInfo.map((taskInfo, i) => {
			if (!taskInfo) {
				return null;
			}

			return <div
				key={taskInfo.id}
				class="task-list__item"
				ref={(ref) => itemsRef.current[i] = ref}
				id={`${idBase}-${taskInfo.id}`}
				data-task-list-drop-target
				data-task-list-item-id={taskInfo.id}
				style={`view-transition-name: ${
					isInViewTransition
						? `${idBase}-${taskInfo.id}`
						: 'none'
				};`}
			>
				{
					onReorder && <span
						class="task-list__drag-handle"
						draggable
						onDragStart={dragStartHandler}
					/>
				}
				<Task
					taskId={taskInfo.id}
					dayName={dayName}
				/>
			</div>;
		})}
	</div>;
}
