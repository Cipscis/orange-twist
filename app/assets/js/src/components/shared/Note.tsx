import { h, type JSX } from 'preact';

import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { nodeHasAncestor, useBlurCallback } from 'util/index';
import { KeyboardShortcutName, useKeyboardShortcut } from 'registers/keyboard-shortcuts';

import { Markdown } from './Markdown';

interface NoteProps {
	note: string | null;
	onNoteChange: (note: string) => void;
	saveChanges: () => void;
}

/**
 * Display a note as HTML, and provide options to edit
 * it in a textarea as Markdown.
 */
export function Note(props: NoteProps): JSX.Element {
	const {
		note,
		onNoteChange,
		saveChanges,
	} = props;

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const displayNoteRef = useRef<HTMLDivElement>(null);

	const [isEditing, setIsEditing] = useState(false);
	const dirtyFlag = useRef(false);

	/**
	 * Save changes if there were any, then clear `dirtyFlag`.
	 */
	const saveChangesIfDirty = useCallback(() => {
		if (dirtyFlag.current) {
			saveChanges();
			dirtyFlag.current = false;
		}
	}, [saveChanges]);

	/**
	 * Update the note and, if there were changes, set the dirty flag.
	 */
	const updateNote = useCallback((newNote: string) => {
		if (newNote !== note) {
			onNoteChange(newNote);
			dirtyFlag.current = true;
		}
	}, [note, onNoteChange]);

	/**
	 * Markdown doesn't render leading or trailing spaces, and treats
	 * 3 or more consecutive newlines the same as 2. So tidy the note
	 * to match these expectations.
	 */
	const getCleanedNote = useCallback((): string | null => {
		const textarea = textareaRef.current;
		if (!textarea) {
			// `textarea` should always exist by the point this is called
			/* istanbul ignore next */
			return null;
		}

		const cleanedNote = textarea.value
			.trim()
			.replace(/\n{2}\n+/g, '\n\n');

		return cleanedNote;
	}, []);

	/**
	 * Leave editing mode and save changes.
	 */
	const leaveEditingMode = useCallback(() => {
		setIsEditing(false);
		const cleanedNote = getCleanedNote();
		if (cleanedNote) {
			updateNote(cleanedNote);
		}
		saveChangesIfDirty();
	}, [
		getCleanedNote,
		updateNote,
		saveChangesIfDirty,
	]);

	/**
	 * Leave editing mode if event was received from textarea element.
	 */
	const leaveEditingModeFromTextarea = useCallback(() => {
		if (document.activeElement === textareaRef.current) {
			leaveEditingMode();
		}
	}, [leaveEditingMode]);

	// Leave editing on keyboard shortcut
	useKeyboardShortcut(
		KeyboardShortcutName.EDITING_FINISH,
		leaveEditingModeFromTextarea,
		isEditing
	);

	/**
	 * Enter edit mode on click, unless the user was selecting
	 * text and included text outside the note.
	 */
	const enterEditModeOnClick = useCallback((e: MouseEvent) => {
		const target = e.target;
		if (
			target instanceof HTMLAnchorElement ||
			target instanceof Element && target.matches('a *')
		) {
			// If we clicked within a link, don't enter edit mode
			return;
		}

		const selection = getSelection();
		const hasSelection = selection?.isCollapsed === false;

		if (!hasSelection) {
			// If there's nothing selected, enter edit mode
			e.preventDefault();
			setIsEditing(true);
			return;
		}

		const selectionFocus = selection?.focusNode;
		const displayNote = displayNoteRef.current;
		const selectionInDisplayNote = selectionFocus &&
			displayNote &&
			nodeHasAncestor(selectionFocus, displayNote);

		// If selected text ends within the display note, don't enter edit mode
		if (selectionInDisplayNote) {
			return;
		}

		e.preventDefault();
		setIsEditing(true);
	}, []);

	// Set up event listener to manage tab insertion
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		// If we've just entered editing mode
		if (isEditing) {
			textarea.addEventListener(
				'keydown',
				(e) => {
					// Insert a tab character on tab press
					if (e.key === 'Tab') {
						e.preventDefault();

						const selectionStart = textarea.selectionStart;
						const selectionEnd = textarea.selectionEnd;

						const indentation = '\t';

						if (selectionStart === selectionEnd) {
							const beforeSelection = textarea.value.substring(0, selectionStart);
							const afterSelection = textarea.value.substring(selectionEnd);

							// Insert indentation at the caret
							textarea.value = `${beforeSelection}${indentation}${afterSelection}`;
							textarea.selectionStart = selectionStart + indentation.length;
							textarea.selectionEnd = selectionEnd + indentation.length;
						}
					}
				},
				{ signal },
			);
		}

		return () => {
			controller.abort();
		};
	}, [isEditing, leaveEditingMode]);

	// Leave editing mode when losing focus, but not when the tab loses focus
	useBlurCallback(
		textareaRef,
		leaveEditingMode,
		isEditing,
	);

	// Move focus into textarea when we start editing.
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return;
		}

		// If we've just entered editing mode
		if (isEditing) {
			// Focus on the textarea
			textarea.focus();

			// Move the caret to the end
			const end = textarea.value.length;
			textarea.setSelectionRange(end, end);

			// Scroll to the textarea
			const scrollTop = window.scrollY;
			window.scrollTo({
				top: scrollTop,
				behavior: 'instant',
			});
		}
	}, [isEditing]);

	return <div class="note">
		{isEditing
			? <div
				class="note__edit-content"
				data-content={note}
			>
				<textarea
					ref={textareaRef}
					onInput={(e) => updateNote(e.currentTarget.value)}
				>{note}</textarea>
			</div>
			: <div
				class="note__display-content"
				ref={displayNoteRef}
			>
				{
					note &&
					<Markdown
						content={note}
						onClick={enterEditModeOnClick}
					/>
				}
				<button
					type="button"
					class="note__edit"
					title="Edit note"
					onClick={() => setIsEditing(true)}
				>✏️</button>
			</div>
		}
	</div>;
}
