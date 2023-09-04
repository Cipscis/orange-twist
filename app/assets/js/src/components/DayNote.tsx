import { h } from 'preact';

import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { Markdown } from './Markdown.js';

import { Day } from '../types/Day.js';

import { nodeHasAncestor } from '../util/index.js';

import { setDayData } from '../registers/days/index.js';
import { Command, fireCommand } from '../registers/commands/index.js';

interface DayNoteProps {
	day: Readonly<Day>;
}

export function DayNote(props: DayNoteProps) {
	const { day } = props;
	const { dayName } = day;

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const displayNoteRef = useRef<HTMLDivElement>(null);

	const [isEditing, setIsEditing] = useState(false);
	const dirtyFlag = useRef(false);

	/**
	 * Save changes if there were any, then clear `dirtyFlag`.
	 */
	const saveChanges = useCallback(() => {
		if (dirtyFlag.current) {
			fireCommand(Command.DATA_SAVE);
			dirtyFlag.current = false;
		}
	}, []);

	// Set up event listeners to stop editing, and move focus
	// into textarea when we start editing.
	useEffect(() => {
		const exitEditingModeOnTextareaBlur = () => {
			setIsEditing(false);
			saveChanges();
		};
		const keydownHandler = (e: KeyboardEvent) => {
			// This type assertion is safe
			const textarea = e.target as HTMLTextAreaElement;

			// Leave editing mode on Ctrl + Enter or Escape
			if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'Escape') {
				setIsEditing(false);
				saveChanges();
			}

			// Insert a tab character on tab press
			if (e.key === 'Tab') {
				e.preventDefault();
				const selectionStart = textarea.selectionStart;
				const selectionEnd = textarea.selectionEnd;

				const indentation = '\t';

				if (selectionStart === selectionEnd) {
					// Insert indentation at the caret
					textarea.value = `{beforeSelection}{indentation}{afterSelection}`;
					textarea.selectionStart = selectionStart + indentation.length;
					textarea.selectionEnd = selectionEnd + indentation.length;
				}
			}
		};
		const textarea = textareaRef.current;

		if (isEditing) {
			if (textarea) {
				textarea.addEventListener('blur', exitEditingModeOnTextareaBlur);
				textarea.addEventListener('keydown', keydownHandler);

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
		}

		return () => {
			if (textarea) {
				textarea.removeEventListener('blur', exitEditingModeOnTextareaBlur);
				textarea.removeEventListener('keydown', keydownHandler);
			}
		};
	}, [isEditing, saveChanges]);

	const inputHandler = useCallback(function (e: Event) {
		const textarea = e.target;
		if (!(textarea instanceof HTMLTextAreaElement)) {
			return;
		}

		const note = textarea.value;
		setDayData(dayName, { note });
		dirtyFlag.current = true;
	}, [dayName]);

	const cleanNote = useCallback((e: FocusEvent) => {
		const textarea = e.target;
		if (!(textarea instanceof HTMLTextAreaElement)) {
			return;
		}

		// Markdown doesn't render leading or trailing space, and treats
		// 3 or more consecutive newlines the same as 2. So tidy the note.
		const note = textarea.value
			.trim()
			.replace(/\n{2}\n+/g, '\n\n');
		setDayData(dayName, { note });
	}, [dayName]);

	const clickHandler = useCallback(function (e: MouseEvent) {
		const selection = getSelection();
		const hasSelection = selection?.isCollapsed === false;

		if (!hasSelection) {
			// If there's nothing selected, enter edit mode
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

		setIsEditing(true);
	}, []);

	return <>
		{isEditing
			? <div
				class="day__note-edit-content"
				data-content={day.note}
			>
				<textarea
					onInput={inputHandler}
					onBlur={cleanNote}
					ref={textareaRef}
				>{day.note}</textarea>
			</div>
			: day.note
				? <div
					class="day__note-display-content"
					ref={displayNoteRef}
				>
					<Markdown
						content={day.note}
						onClick={clickHandler}
					/>
				</div>
				: <button
					type="button"
					class="button"
					onClick={() => setIsEditing(true)}
				>✏️</button>
		}
	</>;
}
