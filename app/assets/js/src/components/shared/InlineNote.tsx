import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { classNames, useBlurCallback } from 'utils';
import { Markdown } from './Markdown';
import { IconButton } from './IconButton';

interface InlineNoteProps {
	note: string | null;
	/** A callback called with the updated note when a change is committed. */
	onNoteChange: (note: string) => void;

	placeholder?: string;
	editButtonTitle?: string;

	class?: string;
}

/**
 * Display an inline section of editable Markdown.
 */
export function InlineNote(props: InlineNoteProps): JSX.Element {
	const {
		note,
		onNoteChange,
	} = props;

	const inputRef = useRef<HTMLInputElement>(null);

	const [isEditing, setIsEditing] = useState(false);

	const isDirty = useCallback(() => {
		const input = inputRef.current;
		if (!input) {
			return false;
		}

		return input.value !== input.defaultValue;
	}, []);

	/** Enter edit mode. */
	const enterEditMode = useCallback(() => {
		setIsEditing(true);
	}, []);

	/** Leave edit mode, and commit changes. */
	const commitAndExit = useCallback(() => {
		if (isDirty()) {
			onNoteChange(inputRef.current?.value?.trim() ?? '');
		}
		setIsEditing(false);
	}, [isDirty, onNoteChange]);

	/** Leave edit mode, discard any changes. */
	const discardAndExit = useCallback(() => {
		setIsEditing(false);
	}, []);

	/**
	 * Enter edit mode when clicking the note, *unless* a link was clicked.
	 */
	const enterEditModeOnNoteClick = useCallback((e: Event) => {
		const { target } = e;

		if (
			target instanceof HTMLAnchorElement ||
			target instanceof Element && target.matches('a *')
		) {
			// If we clicked within a link, don't enter edit mode
			return;
		}

		e.preventDefault();
		enterEditMode();
	}, [enterEditMode]);

	/**
	 * Enter edit mode when clicking the edit button.
	 */
	const enterEditModeOnButtonClick = useCallback((e: Event) => {
		e.preventDefault();
		enterEditMode();
	}, [enterEditMode]);

	/**
	 * Blur on "Enter" or "Escape", either committing or discarding changes.
	 */
	const keydownHandler = useCallback((e: KeyboardEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		if (e.key === 'Enter') {
			commitAndExit();
			return;
		}

		if (e.key === 'Escape') {
			discardAndExit();
			return;
		}
	}, [commitAndExit, discardAndExit]);

	// Prevent space from triggering a click event on certain types of parent element, e.g. `<summary>`
	const keyupHandler = useCallback((e: KeyboardEvent) => {
		if (e.key === ' ') {
			e.preventDefault();
		}
	}, []);

	// Leave edit mode on blur, but not when the tab loses focus
	useBlurCallback(
		inputRef,
		commitAndExit,
		isEditing,
	);

	// Prompt the user about losing unsaved changes if the tab is closed in edit mode
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		if (isEditing) {
			window.addEventListener(
				'beforeunload',
				(e) => {
					if (isDirty()) {
						e.preventDefault();
					}
				},
				{ signal }
			);
		}

		return () => controller.abort();
	}, [isEditing, isDirty]);

	// Automatically focus on input when entering edit mode
	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus();
		}
	}, [isEditing]);

	return <form
		class={classNames('inline-note', props.class)}
	>
		{
			isEditing &&
			<input
				ref={inputRef}
				type="text"
				class="inline-note__input"
				defaultValue={note ?? ''}
				placeholder={props.placeholder ?? 'Note'}
				size={1}
				onKeyDown={keydownHandler}
				onKeyUp={keyupHandler}
			/>
		}

		{
			!isEditing && note &&
			<Markdown
				content={note?.replace(/</g, '&lt;')}
				inline
				class="inline-note__display"
				onClick={enterEditModeOnNoteClick}
				data-testid="inline-note__note"
			/>
		}

		<IconButton
			class="inline-note__edit"
			title={props.editButtonTitle ?? 'Edit note'}
			icon="✏️"
			onClick={enterEditModeOnButtonClick}
		/>
	</form>;
}
