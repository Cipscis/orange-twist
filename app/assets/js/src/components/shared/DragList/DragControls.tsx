import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { IconButton } from '../IconButton';

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

	return <>
		{/* Drag handle for fine pointer devices */}
		<span
			class="drag-list__drag-handle"
			draggable
			onDragStart={dragStartHandler}
		/>

		{/* Buttons for coarse pointer devices */}
		<div class="drag-list__move-button">
			<IconButton
				icon="&#x2303;"
				title="Move up"
				onClick={moveUp}
			/>
		</div>
	</>;
}
