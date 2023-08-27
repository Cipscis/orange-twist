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
	const editButtonRef = useRef<HTMLButtonElement>(null);

	const [isEditing, setIsEditing] = useState(false);

	/**
	 * Used to determine whether or not to move focus automatically when leaving editing mode.
	 */
	const closedWithKeyboardShortcut = useRef<boolean>(false);

	// Set up event listeners to stop editing, and move focus
	// into textarea when we start editing and onto edit button
	// when we stop editing.
	useEffect(() => {
		const exitEditingModeOnTextareaBlur = () => {
			if (closedWithKeyboardShortcut.current) {
				return;
			}

			setIsEditing(false);
			// TODO: Only save if something changed.
			api.save();
		};
		const exitEditingModeOnCtrlEnter = (e: KeyboardEvent) => {
			if (e.key === 'Enter' && e.ctrlKey) {
				closedWithKeyboardShortcut.current = true;
				setIsEditing(false);
				// TODO: Only save if something changed.
				api.save();
			}
		};
		const textarea = textareaRef.current;

		if (isEditing) {
			if (textarea) {
				textarea.addEventListener('blur', exitEditingModeOnTextareaBlur);
				textarea.addEventListener('keydown', exitEditingModeOnCtrlEnter);

				textarea.focus();
				// Move the caret to the end
				const end = textarea.value.length;
				textarea.setSelectionRange(end, end);
			}
		} else if (closedWithKeyboardShortcut.current === true) {
			closedWithKeyboardShortcut.current = false;
			editButtonRef.current?.focus();
		}

		return () => {
			if (textarea) {
				textarea.removeEventListener('blur', exitEditingModeOnTextareaBlur);
				textarea.removeEventListener('keydown', exitEditingModeOnCtrlEnter);
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

	return html`
		${isEditing
			? html`
				<button
					type="button"
					class="day__note-done"
					title="Done editing"
					onClick="${() => setIsEditing(false)}"
				>👍</button>
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
				<button
					type="button"
					class="day__note-edit"
					title="Edit"
					onClick="${() => setIsEditing(true)}"
					ref="${editButtonRef}"
				>✏️</button>
				<${Markdown}
					...${{
						content: day.note,
					} as MarkdownProps}
					onClick="${() => setIsEditing(true)}"
				/>
			`
		}
	`;
}
