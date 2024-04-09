import {
	h,
	type JSX,
	type VNode,
} from 'preact';
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
} from 'preact/hooks';

import { classNames, useViewTransition } from 'utils';

interface DragListChildProps {
	['data-drag-list-key']: number;
}

interface DragListProps {
	class?: string;
	onReorder?: (keys: readonly number[]) => void;

	children: VNode<DragListChildProps> | VNode<DragListChildProps>[];
}

export function DragList(props: DragListProps): JSX.Element {
	const {
		class: className,
		onReorder,
	} = props;

	const children = useMemo(() => {
		if (Array.isArray(props.children)) {
			return props.children;
		} else {
			return [props.children];
		}
	}, [props.children]);

	// Check every child has a unique data-drag-list-key prop
	// Ideally its presence would be enforced by TypeScript,
	// but it's not. This issue from 2018 does an absolutely
	// terrible job of communicating anything at all but I'm
	// pretty sure it's about this shortcoming
	// https://github.com/microsoft/TypeScript/issues/21699
	useEffect(() => {
		const keys = children.map((child) => child.props['data-drag-list-key']);

		const invalidKeys = keys.filter((key) => (
			typeof key !== 'number' ||
			isNaN(key)
		));
		if (invalidKeys.length) {
			/* @ts-expect-error This is for catching error TypeScript misses */
			if (invalidKeys.indexOf(undefined) !== -1) {
				console.error(`Error: Missing prop. Every child in a DragList component must have a data-drag-list-key prop.`);
			} else {
				console.error(`Error: Invalid prop ${invalidKeys[0]}. Every child in a DragList component must have a numeric data-drag-list-key prop.`);
			}
			return;
		}

		const keysSet = new Set(keys);
		if (keys.length !== keysSet.size) {
			const dupe = keys.find((el) => keys.indexOf(el) !== keys.lastIndexOf(el));
			console.error(`Error: Duplicate prop ${dupe}. Every child in a DragList component must have a unique data-drag-list-key prop.`);
		}
	}, [children]);

	const idBase = useId();

	const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
	const isInDraggingMode = useRef(false);

	const {
		startViewTransition,
		isInViewTransition,
	} = useViewTransition();

	/**
	 * Set up the metadata for a drag operation.
	 */
	const dragStartHandler = useCallback((e: DragEvent) => {
		const target = e.currentTarget;
		if (!(target instanceof HTMLElement)) {
			return;
		}
		const itemEl = target.parentElement;

		const { dataTransfer } = e;
		if (!(itemEl && dataTransfer)) {
			return;
		}

		isInDraggingMode.current = true;

		dataTransfer.dropEffect = 'move';
		dataTransfer.setDragImage(itemEl, 0, 0);
		dataTransfer.clearData();
		dataTransfer.setData('text/plain', itemEl.dataset.dragListKey ?? '');
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

		const dropTarget = e.target.closest('[data-drag-list-drop-target]');
		if (dropTarget) {
			// Prevent the default "drag over" action to allow drop events
			e.preventDefault();
		}
	}, []);

	/**
	 * Handle calling the {@linkcode onReorder} callback when dropped.
	 */
	const dropHandler = useCallback((e: DragEvent) => {
		if (!(
			onReorder &&
			(e.target instanceof Element) &&
			e.dataTransfer
		)) {
			console.error('fail at start');
			return;
		}

		const dropTarget = e.target.closest('[data-drag-list-drop-target]');
		const dropData = e.dataTransfer.getData('text/plain');
		const draggedElement = document.querySelector<HTMLElement>(`[data-drag-list-key="${dropData}"]`);

		if (!(
			(dropTarget instanceof HTMLElement)
			&& draggedElement
		)) {
			return;
		}

		isInDraggingMode.current = false;

		const newOrder = itemsRef.current
			// First, remove null entries
			.filter((el): el is NonNullable<typeof el> => (
				el !== null && typeof el !== 'undefined'
			))
			// Then, map to key
			.map(
				(element) => {
					return Number(element.dataset.dragListKey);
				}
			);

		// Determine the positions of the dragged element and drop target
		// to determine where to move the dragged element from and to
		const dropTargetKey = Number(dropTarget.dataset.dragListKey);
		const draggedElementKey = Number(draggedElement.dataset.dragListKey);

		const dropTargetIndex = newOrder.indexOf(dropTargetKey);
		const draggedElementIndex = newOrder.indexOf(draggedElementKey);

		// Removing first then adding back at the target index
		// means it will get inserted before if dragged back or
		// inserted after if dragged forwards without needing
		// an extra check
		newOrder.splice(draggedElementIndex, 1);
		newOrder.splice(dropTargetIndex, 0, Number(draggedElement.dataset.dragListKey));

		startViewTransition(() => onReorder(newOrder));
	}, [onReorder, startViewTransition]);

	return <ul
		class={classNames('drag-list', className)}
		onDragOver={dragOverHandler}
		onDrop={dropHandler}
	>
		{children.map((child, i) => (
			child &&
			<li
				class="drag-list__item"
				key={child.props['data-drag-list-key']}
				ref={(ref) => itemsRef.current[i] = ref}
				data-drag-list-drop-target
				data-drag-list-key={child.props['data-drag-list-key']}
				style={{
					viewTransitionName: isInViewTransition
						? `${idBase}-${child.props['data-drag-list-key']}`
						: 'none',
				}}
			>
				{
					onReorder && <span
						class="drag-list__drag-handle"
						draggable
						onDragStart={dragStartHandler}
					/>
				}
				{child}
			</li>
		))}
	</ul>;
}

<DragList>
	<li />
</DragList>;
