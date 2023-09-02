import { h } from 'preact';
import { useCallback, useId, useRef } from 'preact/hooks';

import htm from 'htm';
import classNames from 'classnames';

import { Task } from '../types/Task.js';

import { getTaskData } from '../registers/tasks/tasksRegister.js';
import { TaskComponent, TaskComponentProps } from './TaskComponent.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface TaskListProps {
	tasks: ReadonlyArray<Readonly<Task>>;
	dayName?: string;
	className?: string;

	onReorder?: (taskIds: number[]) => void;
}

export function TaskList(props: TaskListProps) {
	const {
		tasks,
		dayName,
		className,

		onReorder,
	} = props;

	const idBase = useId();

	const itemsRef = useRef<Array<HTMLElement>>([]);

	const dragStartHandler = useCallback((i: number) => {
		return (e: DragEvent) => {
			const itemEl = itemsRef.current[i];
			const dataTransfer = e.dataTransfer;
			if (!(itemEl && dataTransfer)) {
				return;
			}

			dataTransfer.dropEffect = 'move';
			dataTransfer.setDragImage(itemEl, 0, 0);
			dataTransfer.clearData();
			dataTransfer.setData('text/plain', itemEl.id);
		};
	}, []);

	/**
	 * Detect if an item is being dragged over a valid drop target,
	 * and allow drop events if so.
	 */
	const dragOverHandler = useCallback((e: DragEvent) => {
		if (!(e.target instanceof HTMLElement)) {
			return;
		}

		// TODO: Don't allow items to be dropped into other lists
		const dropTarget = e.target.closest<HTMLElement>('[data-task-list-drop-target]');
		if (dropTarget) {
			// Prevent the default "drag over" action to allow drop events
			e.preventDefault();
		}
	}, []);

	/**
	 * Handle moving an element when dropped, and emiting an event.
	 */
	const dropHandler = useCallback(async (e: DragEvent) => {
		if (!onReorder) {
			return;
		}

		if (!(e.target instanceof HTMLElement && e.dataTransfer)) {
			return;
		}

		const dropTarget = e.target.closest('[data-task-list-drop-target]');
		const dropData = e.dataTransfer.getData('text/plain');
		const draggedElement = document.getElementById(dropData);

		if (!(dropTarget instanceof HTMLElement && draggedElement)) {
			return;
		}

		// Construct a new order of tasks to send to `onReorder`
		const newTasksOrder = Array.from(itemsRef.current).map((element) => Number(element.dataset.taskListItemId));
		const dropTargetIndex = (newTasksOrder as unknown[]).indexOf(Number(dropTarget.dataset.taskListItemId));
		const draggedElementIndex = (newTasksOrder as unknown[]).indexOf(Number(draggedElement.dataset.taskListItemId));

		// Move the dragged element
		if (dropTarget.compareDocumentPosition(draggedElement) === Node.DOCUMENT_POSITION_FOLLOWING) {
			// Put the dragged element before the drop target
			// dropTarget.before(draggedElement);
			newTasksOrder.splice(draggedElementIndex, 1);
			newTasksOrder.splice(dropTargetIndex, 0, Number(draggedElement.dataset.taskListItemId));
		} else {
			// Put the dragged element after the drop target
			// dropTarget.after(draggedElement);
			newTasksOrder.splice(dropTargetIndex + 1, 0, Number(draggedElement.dataset.taskListItemId));
			newTasksOrder.splice(draggedElementIndex, 1);
		}

		document.startViewTransition(() => {
			onReorder(newTasksOrder);
		});
	}, [onReorder]);

	return html`
		<div
			class="${classNames('task-list', className)}"
			onDragOver="${dragOverHandler}"
			onDrop="${dropHandler}"
		>
			${tasks.map((task, i) => {
				const taskData = getTaskData(task.id);
				if (!taskData) {
					return '';
				}

				const taskComponentProps: TaskComponentProps = {
					task: { ...taskData, ...task },
					dayName,
				};
				return html`
					<div
						class="task-list__item"
						ref="${(ref: HTMLElement) => itemsRef.current[i] = ref}"
						id="${`${idBase}-${taskData.id}`}"
						data-task-list-drop-target
						data-task-list-item-id="${taskData.id}"
						style="view-transition-name: ${idBase}-${taskData.id};"
					>
						${
							onReorder && html`
							<span
								class="task-list__drag-handle"
								draggable
								onDragStart="${dragStartHandler(i)}"
							></span>
							`
						}
						<${TaskComponent}
							key="${taskData.id}"
							...${taskComponentProps}
						/>
					</div>
				`;
			})}
		</div>
	`;
}
