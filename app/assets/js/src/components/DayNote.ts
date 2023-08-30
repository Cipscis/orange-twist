import { h } from 'preact';
import htm from 'htm';

import { setDayData } from '../registers/days/index.js';
import {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';
import { Markdown, MarkdownProps } from './Markdown.js';
import { Day } from '../types/Day.js';
import { OrangeTwistContext } from './OrangeTwist.js';
import { nodeHasAncestor } from '../util/nodeHasAncestor.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface DayNoteProps {
	day: Readonly<Day>;
}

export function DayNote(props: DayNoteProps) {
	const { day } = props;
	const { dayName } = day;

	const api = useContext(OrangeTwistContext);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const displayNoteRef = useRef<HTMLElement>(null);

	const [isEditing, setIsEditing] = useState(false);

	// Set up event listeners to stop editing, and move focus
	// into textarea when we start editing.
	useEffect(() => {
		const exitEditingModeOnTextareaBlur = () => {
			setIsEditing(false);
			// TODO: Only save if something changed.
			api.save();
		};
		const keydownHandler = (e: KeyboardEvent) => {
			// This type assertion is safe
			const textarea = e.target as HTMLTextAreaElement;

			// Leave editing mode on Ctrl + Enter or Escape
			if ((e.key === 'Enter' && e.ctrlKey) || e.key === 'Escape') {
				setIsEditing(false);
				// TODO: Only save if something changed.
				api.save();
			}

			// Insert a tab character on tab press
			if (e.key === 'Tab') {
				e.preventDefault();
				const selectionStart = textarea.selectionStart;
				const selectionEnd = textarea.selectionEnd;

				const beforeSelection = textarea.value.substring(0, selectionEnd);
				const afterSelection = textarea.value.substring(selectionEnd);

				const indentation = '\t';

				if (selectionStart === selectionEnd) {
					// Insert indentation at the caret
					textarea.value = `${beforeSelection}${indentation}${afterSelection}`;
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

				textarea.focus();
				// Move the caret to the end
				const end = textarea.value.length;
				textarea.setSelectionRange(end, end);
			}
		}

		return () => {
			if (textarea) {
				textarea.removeEventListener('blur', exitEditingModeOnTextareaBlur);
				textarea.removeEventListener('keydown', keydownHandler);
			}
		};
	}, [isEditing]);

	const inputHandler = useCallback(function (e: InputEvent) {
		const textarea = e.target;
		if (!(textarea instanceof HTMLTextAreaElement)) {
			return;
		}

		const note = textarea.value;
		setDayData(dayName, { note });
	}, []);

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

	return html`
		${isEditing
			? html`
				<div
					class="day__note-edit-content"
					data-content="${day.note}"
				>
					<textarea
						onInput="${inputHandler}"
						ref="${textareaRef}"
					>${day.note}</textarea>
				</div>
			`
			: html`
				<div
					class="day__note-display-content"
					ref="${displayNoteRef}"
				>
					<${Markdown}
						...${{
							content: day.note,
						} as MarkdownProps}
						onClick="${clickHandler}"
					/>
				</div>
			`
		}
	`;
}
