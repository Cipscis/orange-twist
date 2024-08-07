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

import { DragControls } from './DragControls';

const keyProp = 'data-drag-list-key';

interface DragListChildProps {
	[keyProp]: number;
}

interface DragListProps {
	class?: string;
	onReorder?: (keys: readonly number[]) => void;

	children: VNode<DragListChildProps> | VNode<DragListChildProps>[];
}

const keyMap = new WeakMap<HTMLElement, number>();

/**
 * Get the drag list key of a child VNode or HTML element.
 */
function getKey(
	el: VNode<DragListChildProps> | HTMLElement
): number {
	if (el instanceof HTMLElement) {
		const key = keyMap.get(el);
		if (typeof key === 'undefined') {
			throw new Error(`Error: could not retrieve drag list key for element`);
		}
		return key;
	} else {
		return el.props[keyProp];
	}
}

/**
 * Checks if a drag list key is valid.
 * Numbers that aren't NaN are valid keys.
 */
function isValidKey(key: number): boolean {
	if (typeof key === 'number') {
		return !isNaN(key);
	} else {
		return false;
	}
}

/**
 * Render a list of elements that can be dragged and dropped to
 * call an `onReorder` callback. Each child element requires a
 * `data-drag-list-key` prop with a unique numeric value.
 */
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

	// Check every child has a unique numeric data-drag-list-key
	// prop. Ideally its presence would be enforced by TypeScript,
	// but it's not. This issue from 2018 does an absolutely
	// terrible job of communicating anything at all but I'm
	// pretty sure it's about this shortcoming
	// https://github.com/microsoft/TypeScript/issues/21699
	useEffect(() => {
		const keys = children.map(getKey);

		const invalidKeys = keys.filter((key) => !isValidKey(key));
		if (invalidKeys.length) {
			/* @ts-expect-error This is for catching error TypeScript misses */
			if (invalidKeys.indexOf(undefined) !== -1) {
				throw new Error(`Error: Missing prop. Every child in a DragList component must have a ${keyProp} prop.`);
			} else {
				throw new Error(`Error: Invalid prop ${invalidKeys[0]}. Every child in a DragList component must have a numeric ${keyProp} prop.`);
			}
			return;
		}

		const keysSet = new Set(keys);
		if (keys.length !== keysSet.size) {
			const dupe = keys.find((el) => keys.indexOf(el) !== keys.lastIndexOf(el));
			throw new Error(`Error: Duplicate prop ${dupe}. Every child in a DragList component must have a unique ${keyProp} prop.`);
		}
	}, [children]);

	const idBase = useId();

	const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
	const draggedItemKeyRef = useRef<number | null>(null);

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

		draggedItemKeyRef.current = getKey(itemEl);

		dataTransfer.dropEffect = 'move';
		dataTransfer.setDragImage(itemEl, 0, 0);
	}, []);

	/**
	 * Detect if an item is being dragged over a valid drop target,
	 * and allow drop events if so.
	 */
	const dragOverHandler = useCallback((e: DragEvent) => {
		if (!(e.target instanceof Element)) {
			return;
		}

		if (draggedItemKeyRef.current === null) {
			return;
		}

		const dropTarget = e.target.closest('[data-drag-list-drop-target]');
		if (dropTarget) {
			// Prevent the default "drag over" action to allow drop events
			e.preventDefault();
		}
	}, []);

	/**
	 * Moves the item with a specified key to the position of an item
	 * with a specified target key.
	 *
	 * The moved item will be moved one spot past the target item,
	 * e.g. if it was previously after the target then after this
	 * operation it will be in the slot before the target.
	 *
	 * This function also calls {@linkcode onReorder} with the new order.
	 */
	const moveItemTo = useCallback((itemKey: number, targetKey: number) => {
		if (!(
			onReorder &&
			itemKey !== targetKey
		)) {
			return;
		}

		const newOrder = itemsRef.current
			// First, remove null entries
			.filter((el): el is NonNullable<typeof el> => (
				el !== null && typeof el !== 'undefined'
			))
			// Then, map to key
			.map((el) => getKey(el));

		// Determine the positions of the moved item and target item
		// to determine where to move the moved item from and to

		const itemIndex = newOrder.indexOf(itemKey);
		const targetIndex = newOrder.indexOf(targetKey);

		// Removing first then adding back at the target index
		// means it will get inserted before if moved back or
		// inserted after if moved forwards without needing
		// an extra check
		newOrder.splice(itemIndex, 1);
		newOrder.splice(targetIndex, 0, itemKey);

		startViewTransition(() => onReorder(newOrder));
	}, [onReorder, startViewTransition]);

	/**
	 * Moves the item with a specified key by a specified offset. Negative
	 * offsets will move the item up, whereas positive offsets will move it
	 * down. At most, it will be moved to the start or end of the list.
	 */
	const moveItemBy = useCallback((itemKey: number, offset: number) => {
		const keyOrder = itemsRef.current
			// First, remove null entries
			.filter((el) => el !== null)
			// Then, map to key
			.map((el) => getKey(el));

		const itemIndex = keyOrder.indexOf(itemKey);
		let targetIndex = itemIndex + offset;

		if (targetIndex < 0) {
			targetIndex = 0;
		} else if (targetIndex >= keyOrder.length) {
			targetIndex = keyOrder.length - 1;
		}

		const targetKey = keyOrder[targetIndex];
		moveItemTo(itemKey, targetKey);
	}, [moveItemTo]);

	/**
	 * Move dragged item to new position when it's dropped.
	 */
	const dropHandler = useCallback((e: DragEvent) => {
		if (!(
			(e.target instanceof Element) &&
			draggedItemKeyRef.current !== null
		)) {
			return;
		}

		const dropTarget = e.target.closest('[data-drag-list-drop-target]');
		if (!(dropTarget instanceof HTMLElement)) {
			return;
		}

		const draggedItemKey = draggedItemKeyRef.current;
		draggedItemKeyRef.current = null;
		const dropTargetKey = getKey(dropTarget);

		moveItemTo(draggedItemKey, dropTargetKey);
	}, [moveItemTo]);

	return <ul
		class={classNames('drag-list', className)}
		onDragOver={dragOverHandler}
		onDrop={dropHandler}
	>
		{children.map((child, i) => (
			child &&
			<li
				class="drag-list__item"
				key={getKey(child)}
				ref={(ref) => {
					itemsRef.current[i] = ref;
					if (ref) {
						keyMap.set(ref, getKey(child));
					}
				}}
				data-drag-list-drop-target
				style={{
					viewTransitionName: isInViewTransition
						? `${idBase}-${getKey(child)}`
						: 'none',
				}}
			>
				{
					onReorder && <DragControls
						dragStartHandler={dragStartHandler}
						moveItemBy={moveItemBy}
						itemKey={getKey(child)}
					/>
				}
				{child}
			</li>
		))}
	</ul>;
}
