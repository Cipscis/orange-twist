import { h } from 'preact';
import htm from 'htm';

import { setDayData } from '../registers/days/index.js';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';
import { Markdown, MarkdownProps } from './Markdown.js';
import { Day } from '../types/Day.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface DayNoteProps {
	day: Readonly<Day>;
}

export function DayNote(props: DayNoteProps) {
	const { day } = props;
	const { dayName } = day;

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const editButtonRef = useRef<HTMLButtonElement>(null);

	const [isEditing, setIsEditing] = useState(false);

	// Set up event listeners to stop editing, and move focus
	// into textarea when we start editing and onto edit button
	// when we stop editing.
	useEffect(() => {
		const exitEditingModeOnTextareaBlur = () => setIsEditing(false);
		const exitEditingModeOnCtrlEnter = (e: KeyboardEvent) => {
			if (e.key === 'Enter' && e.ctrlKey) {
				setIsEditing(false);
			}
		};
		const textarea = textareaRef.current;

		if (isEditing) {
			if (textarea) {
				textarea.addEventListener('blur', exitEditingModeOnTextareaBlur);
				textarea.addEventListener('keydown', exitEditingModeOnCtrlEnter);

				textarea.focus();
			}
		} else {
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
