import { h } from 'preact';
import htm from 'htm';

import { setDayData, useDay } from '../registers/days/index.js';
import { useCallback, useState } from 'preact/hooks';
import { Markdown, MarkdownProps } from './Markdown.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface DayNoteProps {
	dayName: string;
}

export function DayNote(props: DayNoteProps) {
	const { dayName } = props;

	const day = useDay(dayName);
	if (day === null) {
		return null;
	}

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
				<button type="button" onClick="${() => setIsEditing(false)}">Done editing</button>
				<textarea onInput="${inputHandler}">${day.note}</textarea>
			`
			: html`
				<button type="button" onClick="${() => setIsEditing(true)}">Edit</button>
				<${Markdown} ...${{ content: day.note } as MarkdownProps} />
			`
		}
	`;
}
