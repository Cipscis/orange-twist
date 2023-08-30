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

	const [isEditing, setIsEditing] = useState(false);

	// Set up event listeners to stop editing, and move focus
	// into textarea when we start editing.
	useEffect(() => {
		const exitEditingModeOnTextareaBlur = () => {
			setIsEditing(false);
			// TODO: Only save if something changed.
			api.save();
		};
		const exitEditingModeOnCtrlEnter = (e: KeyboardEvent) => {
			if (e.key === 'Enter' && e.ctrlKey) {
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
