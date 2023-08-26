import { h } from 'preact';
import htm from 'htm';

import { setDayData } from '../registers/days/index.js';
import { useCallback, useState } from 'preact/hooks';
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

	const [isEditing, setIsEditing] = useState(false);

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
				/>
			`
		}
	`;
}
