import { h, type JSX } from 'preact';

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'preact/hooks';

import {
	classNames,
	nodeHasAncestor,
	useBlurCallback,
	usePropAsRef,
} from 'utils';

import { saveImage } from 'images';

import {
	KeyboardShortcutName,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import { Markdown } from './Markdown';
import { IconButton } from './IconButton';

interface NoteProps {
	note: string | null;
	onNoteChange: (note: string) => void;
	saveChanges: () => void;

	class?: string;
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

	// Launder `note` through a ref so it doesn't cause
	// too many side effects every time it changes
	const noteRef = usePropAsRef(note);

	const spaceholderRef = useRef<HTMLDivElement>(null);
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
	 * Check whether or not a specified note string is different
	 * from the note value passed as a prop.
	 */
	const hasNoteChanged = useCallback((newNote: string) => {
		if (newNote === noteRef.current) {
			return false;
		}

		if (
			newNote === '' &&
			noteRef.current === null
		) {
			return false;
		}

		return true;
	}, [noteRef]);

	/**
	 * Update the note and, if there were changes, set the dirty flag.
	 */
	const updateNote = useCallback((newNote: string) => {
		if (hasNoteChanged(newNote)) {
			onNoteChange(newNote);
			dirtyFlag.current = true;
		}
	}, [onNoteChange, hasNoteChanged]);

	const updateSpaceholderSize = useCallback((note: string) => {
		const spaceholder = spaceholderRef.current;
		if (!spaceholder) {
			return;
		}

		// CSS causes this content to be rendered in a way that is hidden but occupies space
		spaceholder.dataset.content = note;
	}, []);

	const noteInputHandler = useCallback<JSX.InputEventHandler<HTMLTextAreaElement>>(
		(e) => {
			const newNote = e.currentTarget.value;
			updateSpaceholderSize(newNote);
			if (hasNoteChanged(newNote)) {
				dirtyFlag.current = true;
			}
		},
		[
			updateSpaceholderSize,
			hasNoteChanged,
		]
	);

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
		if (cleanedNote !== null) {
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

	/**
	 * Enter editing mode.
	 */
	const enterEditingMode = useCallback(() => {
		setIsEditing(true);
	}, []);

	/**
	 * Enter editing mode on click, unless the user was selecting
	 * text and included text outside the note.
	 */
	const enterEditingModeOnNoteClick = useCallback((e: MouseEvent) => {
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
			enterEditingMode();
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
		enterEditingMode();
	}, [enterEditingMode]);

	// Leave editing on keyboard shortcut
	useKeyboardShortcut(
		KeyboardShortcutName.EDITING_FINISH,
		leaveEditingModeFromTextarea,
		isEditing
	);

	// Initialise spaceholder size when entering editing mode
	useLayoutEffect(() => {
		if (isEditing) {
			updateSpaceholderSize(noteRef.current ?? '');
		}
	}, [
		isEditing,
		updateSpaceholderSize,
		noteRef,
	]);

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

	// Listen for pasted or dropped images
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!(
			isEditing &&
			textarea
		)) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		/**
		 * Retrieves an image from a `DataTransfer` object, if it has one.
		 */
		const getImage = (
			dataTransfer: DataTransfer | null
		): File | null => {
			const file = dataTransfer?.files?.[0];
			if (!file) {
				return null;
			}

			if (!file.type.startsWith('image/')) {
				return null;
			}

			return file;
		};

		/**
		 * Inserts text into the textarea to render a given image.
		 */
		const insertImage = async (file: File) => {
			const hash = await saveImage(file);

			const valueArr = [...textarea.value];
			const { selectionStart, selectionEnd } = textarea;
			const selectionSize = selectionEnd - selectionStart;

			/*
			TODO: Create the image URL string in the same place
			where the logic to replace it exists
			*/
			const insertedContent = `![](image:${hash})`;
			valueArr.splice(selectionStart, selectionSize, insertedContent);

			textarea.value = valueArr.join('');
			// Insert selection where alt text will go
			textarea.selectionStart = selectionStart + 2;
			textarea.selectionEnd = selectionStart + 2;
		};

		// Listen for pasted images, and insert them.
		textarea.addEventListener(
			'paste',
			(e) => {
				const file = getImage(e.clipboardData);
				if (!file) {
					return;
				}
				insertImage(file);
			},
			{ signal }
		);

		// Allow images to be dragged and dropped into the textarea.
		textarea.addEventListener(
			'dragover',
			(e) => {
				const items = Array.from(e.dataTransfer?.items ?? []);
				if (!items.some((item) => {
					if (item.kind !== 'file') {
						return false;
					}
					if (!item.type.startsWith('image/')) {
						return false;
					}
					return true;
				})) {
					return;
				}

				e.preventDefault();
			},
			{ signal }
		);

		// Listen for images being dropped, and insert them.
		textarea.addEventListener(
			'drop',
			(e) => {
				const file = getImage(e.dataTransfer);
				if (!file) {
					return;
				}
				insertImage(file);
				e.preventDefault();
			},
			{ signal }
		);

		return () => controller.abort();
	}, [isEditing]);

	return <div class={classNames('note', props.class)}>
		{isEditing
			? <div
				class="note__edit-content"
				ref={spaceholderRef}
			>
				<textarea
					ref={textareaRef}
					onInput={noteInputHandler}
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
						onClick={enterEditingModeOnNoteClick}
					/>
				}
				<IconButton
					class="note__edit"
					title="Edit note"
					icon="✏️"
					onClick={enterEditingMode}
				/>
			</div>
		}
	</div>;
}
