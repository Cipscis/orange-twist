import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from 'preact/hooks';

import {
	animate,
	CSSKeyframes,
	useCloseWatcher,
} from 'utils';

import {
	TaskStatus,
	TaskStatusName,
	TaskStatusSymbol,
} from 'types/TaskStatus';

import {
	ButtonVariant,
	IconButton,
} from 'components/shared';

import { TaskStatusButton } from './TaskStatusButton';

interface StatusPickerProps {
	status: TaskStatus;
	onStatusSelect: (status: TaskStatus) => void;
	onDelete: () => void;
	deleteButtonTitle: string;
}

/**
 * Renders a menu for picking a status, or performing certain actions.
 */
export function StatusPicker(props: StatusPickerProps): JSX.Element | null {
	const {
		status,
		onStatusSelect,
		onDelete,
		deleteButtonTitle,
	} = props;

	const rootRef = useRef<HTMLElement>(null);
	const popoverRef = useRef<HTMLDialogElement>(null);
	const optionsRef = useRef<HTMLUListElement>(null);

	// Used to prevent a closing animation display on initial render
	const canAnimateRef = useRef<null | true>(null);

	const [isClosing, setIsClosing] = useState(false);
	const [isInChangeMode, setIsInChangeMode] = useState(false);

	/** Used to avoid rendering contents of closed dialogs in order to reduce DOM size */
	const renderContents = isInChangeMode || isClosing;

	const exitChangeMode = useCallback(() => {
		setIsInChangeMode(false);
		setIsClosing(true);
	}, []);

	const enterChangeMode = useCallback(() => {
		setIsInChangeMode(true);
	}, []);

	const positionAnchorId = useId();
	const positionAnchorName = `--taskStatus_${positionAnchorId}`;

	const onStatusSelectWrapper = useCallback((status: TaskStatus) => {
		onStatusSelect(status);
		exitChangeMode();
	}, [exitChangeMode, onStatusSelect]);

	/**
	 * Remove the task from the current day, if there is one,
	 * otherwise delete it entirely.
	 */
	const onDeleteButtonClick = useCallback(() => {
		if (onDelete) {
			onDelete();
		}
		exitChangeMode();
	}, [exitChangeMode, onDelete]);

	/**
	 * Detect if a click was detected on the backdrop. If it was, exit change mode.
	 */
	const exitChangeModeOnBackdropClick = useCallback((e: MouseEvent) => {
		// The <dialog> element itself is inert, so any detected clicks must have been on the backdrop
		if (e.target === popoverRef.current) {
			exitChangeMode();
		}
	}, [exitChangeMode]);

	// Show and hide the popover when we enter or leave change mode
	useEffect(() => {
		if (!canAnimateRef.current) {
			if (!isInChangeMode) {
				return;
			}
			canAnimateRef.current = true;
		}

		const popover = popoverRef.current;
		if (!popover) {
			return;
		}

		if (isInChangeMode) {
			popover.showModal();
			// The `opening` attribute is used to adjust z-index
			popover.setAttribute('opening', '');
			const animation = animate(popover, CSSKeyframes.APPEAR_SCREEN);
			animation.finished.then(() => popover.removeAttribute('opening'));
		} else {
			const animation = animate(popover, CSSKeyframes.DISAPPEAR_SCREEN);
			animation.finished.then(() => {
				popover.close();
				setIsClosing(false);
			});
		}
	}, [isInChangeMode]);

	// Add "light dismiss" behaviour - close when clicking on backdrop
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		if (isInChangeMode) {
			document.addEventListener('click', exitChangeModeOnBackdropClick, { signal });
		}

		return () => {
			controller.abort();
		};
	}, [isInChangeMode, exitChangeModeOnBackdropClick]);

	// Prevent clicks from within the dialog from toggling summary elements they're contained in
	useEffect(() => {
		const popover = popoverRef.current;
		if (!popover) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		if (isInChangeMode) {
			popover.addEventListener('click', (e) => {
				e.preventDefault();
			}, { signal });
		}

		return () => {
			controller.abort();
		};
	}, [isInChangeMode]);

	// Set up event listeners for closing the popover on UI signals like pressing the "Escape" key
	useCloseWatcher(exitChangeMode, isInChangeMode);

	const statusSymbol = TaskStatusSymbol[status];
	const statusName = TaskStatusName[status];

	return <span
		class="task-status"
		ref={rootRef}
		style={{
			anchorName: positionAnchorName,
		}}
	>
		<IconButton
			title={`${statusName} (click to edit)`}
			icon={statusSymbol}
			onClick={enterChangeMode}
			style={{
				color: `var(--colour-task--${status})`,
			}}
		/>

		<dialog
			class="task-status__popover"
			ref={popoverRef}
			tabindex={-1}
			inert={!isInChangeMode}
			style={{
				positionAnchor: positionAnchorName,
			}}
		>
			{renderContents &&
				<ul
					class="task-status__options"
					ref={optionsRef}
				>
					<li class="task-status__optgroup">
						<ul class="task-status__optgroup-list">
							{Object.values(TaskStatus).map((taskStatus) => (
								<li
									key={taskStatus}
									class="task-status__option"
								>
									<TaskStatusButton
										status={taskStatus}
										onStatusSelect={onStatusSelectWrapper}
									/>
								</li>
							))}
						</ul>
					</li>

					<li class="task-status__optgroup">
						<ul class="task-status__optgroup-list">
							<li class="task-status__option">
								<IconButton
									variant={ButtonVariant.SECONDARY}
									title={deleteButtonTitle}
									icon="🗑️"
									onClick={onDeleteButtonClick}
								/>
							</li>
						</ul>
					</li>
				</ul>
			}
		</dialog>
	</span>;
}
