import { h } from 'preact';
import { useCallback, useId, useRef } from 'preact/hooks';

import classNames from 'classnames';


import { useViewTransition } from 'util/index';

import { getTaskInfo, useTaskInfo } from 'data/tasks';

import { TaskComponent } from './TaskComponent';
import React, { forwardRef } from 'preact/compat';

interface TaskListProps {
	taskIds: readonly number[];
	dayName?: string;
	className?: string;

	onReorder?: (taskIds: number[]) => void;
}

/**
 * Renders a list of specified tasks, which can be
 * reordered via drag & drop.
 */
export const TaskList = forwardRef(
	function TaskList(
		props: TaskListProps,
		ref: React.ForwardedRef<HTMLDivElement>
	) {
		const {
			taskIds,
			dayName,
			className,

			onReorder,
		} = props;

		const tasksInfo = useTaskInfo(taskIds);

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
		const dragStartHandler = useCallback((i: number) => {
			return (e: DragEvent) => {
				const itemEl = itemsRef.current[i];
				const dataTransfer = e.dataTransfer;
				if (!(itemEl && dataTransfer)) {
					return;
				}

				isInDraggingMode.current = true;

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

			if (!isInDraggingMode.current) {
				return;
			}

			const dropTarget = e.target.closest<HTMLElement>('[data-task-list-drop-target]');
			if (dropTarget) {
				// Prevent the default "drag over" action to allow drop events
				e.preventDefault();
			}
		}, []);

		/**
		 * Handle moving an element when dropped, and emiting an event.
		 */
		const dropHandler = useCallback((e: DragEvent) => {
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

			isInDraggingMode.current = false;

			// Construct a new order of tasks to send to `onReorder`
			const newTasksOrder = Array.from(itemsRef.current).map((element) => Number(element?.dataset.taskListItemId));
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

			startViewTransition(() => onReorder(newTasksOrder));
		}, [startViewTransition, onReorder]);

		return <div
			class={classNames('task-list', className)}
			onDragOver={dragOverHandler}
			onDrop={dropHandler}
			ref={ref}
		>
			{tasksInfo.map((taskInfo, i) => {
				if (!taskInfo) {
					return '';
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
							: 'none'};
					`}
				>
					{
						onReorder && <span
							class="task-list__drag-handle"
							draggable
							onDragStart={dragStartHandler(i)}
						/>
					}
					<TaskComponent
						taskId={taskInfo.id}
						dayName={dayName}
					/>
				</div>;
			})}
		</div>;
	}
);
