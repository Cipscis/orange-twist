import {
	h,
	type JSX,
	type RefObject,
} from 'preact';

import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import {
	classNames,
	nodeHasAncestor,
	useBlurCallback,
} from 'utils';
import { useAllowTabInsertion } from './useAllowTabInsertion';
import { useListenForImages } from './useListenForImages';

import {
	KeyboardShortcutName,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import { CustomEventName } from 'types/CustomEventName';

import { Markdown, type MarkdownApi } from '../Markdown';
import { IconButton } from '../IconButton';

interface NoteProps {
	note: string | null;
	/** A callback called with the updated note when a change is committed. */
	onNoteChange: (note: string) => void;

	/**
	 * If a ref object is provided, it will be set to expose
	 * a {@linkcode MarkdownApi} object.
	 */
	markdownApiRef?: RefObject<MarkdownApi>;

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
	} = props;

	const spaceholderRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const displayNoteRef = useRef<HTMLDivElement>(null);

	const [isEditing, setIsEditingInternal] = useState(false);
	const isConfirmingAttachLargeImageRef = useRef(false);
	const setIsEditing = useCallback((value: boolean) => {
		// If the prompt to confirm attaching a large image is open, don't change editing status
		if (isConfirmingAttachLargeImageRef.current) {
			return;
		}

		setIsEditingInternal(value);
	}, []);

	const isDirty = useCallback(() => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return;
		}

		return textarea.value !== note;
	}, [note]);

	/**
	 * Markdown doesn't render leading or trailing spaces, and treats
	 * 3 or more consecutive newlines the same as 2. So tidy the note
	 * to match these expectations.
	 */
	const getCleanedNote = useCallback((): string => {
		const textarea = textareaRef.current;
		if (!textarea) {
			// `textarea` should always exist by the point this is called
			/* istanbul ignore next */
			throw new Error('Could not find textarea');
		}

		const cleanedNote = textarea.value
			.trim()
			.replace(/\n{2}\n+/g, '\n\n');

		return cleanedNote;
	}, []);

	/**
	 * Leave editing mode, and commit changes if there are any to commit.
	 */
	const leaveEditingMode = useCallback(() => {
		setIsEditing(false);
		const cleanedNote = getCleanedNote();
		if (isDirty()) {
			onNoteChange(cleanedNote);
		}
	}, [
		setIsEditing,
		getCleanedNote,
		isDirty,
		onNoteChange,
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
	}, [setIsEditing]);

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

	// Set up event listener to manage tab insertion
	useAllowTabInsertion({
		editorRef: textareaRef,
		condition: isEditing,
	});

	// Prompt the user about losing uncommitted changes if the tab is closed in edit mode
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
	useListenForImages({
		editorRef: textareaRef,
		isConfirmingAttachLargeImageRef,
		condition: isEditing,
	});

	// Re-render on data import
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		document.addEventListener(
			CustomEventName.IMPORT_COMPLETE,
			() => {
				props.markdownApiRef?.current?.rerender();
			},
			{ signal }
		);

		return () => controller.abort();
	}, [props.markdownApiRef]);

	return <div class={classNames('note', props.class)}>
		{isEditing
			? <div
				class="note__edit-content"
				ref={spaceholderRef}
			>
				<textarea
					ref={textareaRef}
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
						apiRef={props.markdownApiRef}
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
