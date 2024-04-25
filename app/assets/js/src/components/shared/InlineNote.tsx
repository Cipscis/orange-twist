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
	onNoteChange: (note: string | null) => void;
	saveChanges: () => void;

	placeholder?: string;
	editButtonTitle?: string;

	class?: string;
}

export function InlineNote(props: InlineNoteProps): JSX.Element {
	const {
		note,
		onNoteChange,
		saveChanges,
	} = props;

	const previousNote = useRef<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [isEditing, setIsEditing] = useState(false);
	const dirtyFlag = useRef(false);

	/**
	 * Update the note and the dirty flag.
	 */
	const updateNote = useCallback((newNote: string) => {
		onNoteChange(newNote);

		const isChangedFromLastUpdate = newNote !== note;
		const isInitialNote = newNote === previousNote.current;
		dirtyFlag.current = isChangedFromLastUpdate && !isInitialNote;
	}, [note, onNoteChange]);

	/** Enter edit mode. */
	const enterEditMode = useCallback(() => {
		previousNote.current = note;
		setIsEditing(true);
	}, [note]);

	/**
	 * Clean the note, save any changes, and leave edit mode.
	 */
	const leaveEditMode = useCallback(() => {
		if (dirtyFlag.current) {
			onNoteChange(note?.trim() ?? null);
			saveChanges();
			dirtyFlag.current = false;
		}
		setIsEditing(false);
	}, [
		onNoteChange,
		note,
		saveChanges,
	]);

	/**
	 * Reset the note to its state when we entered edit mode.
	 */
	const discardChanges = useCallback(() => {
		updateNote(previousNote.current ?? '');
	}, [updateNote]);

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
			leaveEditMode();
			return;
		}

		if (e.key === 'Escape') {
			discardChanges();
			leaveEditMode();
			return;
		}
	}, [discardChanges, leaveEditMode]);

	// Prevent space from triggering a click event on certain types of parent element, e.g. `<summary>`
	const keyupHandler = useCallback((e: KeyboardEvent) => {
		if (e.key === ' ') {
			e.preventDefault();
		}
	}, []);

	// Leave edit mode on blur, but not when the tab loses focus
	useBlurCallback(
		inputRef,
		leaveEditMode,
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
					if (dirtyFlag.current) {
						e.preventDefault();
					}
				},
				{ signal }
			);
		}

		return () => controller.abort();
	}, [isEditing]);

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
				value={note ?? ''}
				placeholder={props.placeholder ?? 'Note'}
				size={1}
				onInput={(e) => updateNote(e.currentTarget.value)}
				onKeyDown={keydownHandler}
				onKeyUp={keyupHandler}
			/>
		}

		{
			note &&
			<Markdown
				content={note?.replace(/</g, '&lt;')}
				inline
				class={classNames('inline-note__display', {
					'inline-note__display--hidden': isEditing,
				})}
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
