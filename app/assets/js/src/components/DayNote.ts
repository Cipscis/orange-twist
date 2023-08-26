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

	const [isEditing, setIsEditing] = useState(false);

	// Set up event listener to stop editing when textarea is blurred,
	// and move focus into textarea when we start editing.
	useEffect(() => {
		const exitEditingModeOnTextareaBlur = () => setIsEditing(false);
		const textarea = textareaRef.current;

		if (isEditing) {
			textarea?.addEventListener('blur', exitEditingModeOnTextareaBlur);
			textarea?.focus();
		}

		return () => {
			textarea?.removeEventListener('blur', exitEditingModeOnTextareaBlur);
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
