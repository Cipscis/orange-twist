import { h, type JSX } from 'preact';

import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { nodeHasAncestor } from '../../util/nodeHasAncestor';
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
			/* istanbul-ignore-next */
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

	// Set up event listeners to stop editing, and move focus
	// into textarea when we start editing.
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const textarea = textareaRef.current;

		if (isEditing && textarea) {
			textarea.addEventListener(
				'blur',
				(e) => leaveEditingMode(),
				{ signal },
			);
			textarea.addEventListener(
				'keydown',
				(e) => {
					// Leave editing mode on Ctrl + Enter or Escape
					if (
						(e.key === 'Enter' && e.ctrlKey) ||
						e.key === 'Escape'
					) {
						leaveEditingMode();
					}

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

			const scrollTop = window.scrollY;
			textarea.focus();
			// Move the caret to the end
			const end = textarea.value.length;
			textarea.setSelectionRange(end, end);
			window.scrollTo({
				top: scrollTop,
				behavior: 'instant',
			});
		}

		return () => {
			controller.abort();
		};
	}, [isEditing, leaveEditingMode]);

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
