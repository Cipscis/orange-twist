import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

interface DragControlsProps {
	dragStartHandler: (e: DragEvent) => void;
	moveItemBy: (itemKey: number, offset: number) => void;

	itemKey: number;
}

export function DragControls(props: DragControlsProps): JSX.Element {
	const {
		dragStartHandler,
		moveItemBy,

		itemKey,
	} = props;

	const moveUp = useCallback(
		() => moveItemBy(itemKey, -1),
		[moveItemBy, itemKey]
	);

	const moveDown = useCallback(
		() => moveItemBy(itemKey, +1),
		[moveItemBy, itemKey]
	);

	return <>
		{/* Drag handle for fine pointer devices */}
		<span
			class="drag-list__drag-handle"
			draggable
			onDragStart={dragStartHandler}
		/>

		{/* Up and down buttons for coarse pointer devices */}
		<div class="drag-list__move-buttons">
			<button
				type="button"
				title="Move up"
				onClick={moveUp}
				class="drag-list__move-button"
			>&#x2303;</button>
			<button
				type="button"
				title="Move down"
				onClick={moveDown}
				class="drag-list__move-button"
			>&#x2304;</button>
		</div>
	</>;
}
