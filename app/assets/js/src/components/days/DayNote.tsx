import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setDayInfo,
	type DayInfo,
} from 'data';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import type { MarkdownApi } from 'components/shared/Markdown';
import { Note } from 'components/shared';

interface DayNoteProps {
	day: Readonly<DayInfo>;
}

/**
 * Renders a note for a specified day, including the ability to
 * edit that note.
 */
export function DayNote(props: DayNoteProps): JSX.Element {
	const { day } = props;
	const { name } = day;

	const { isLoading } = useContext(OrangeTwistContext);

	const onNoteChange = useCallback(
		(note: string) => setDayInfo(name, { note }),
		[name]
	);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

	const markdownApiRef = useRef<MarkdownApi | null>(null);
	// When data is finished loading re-render Markdown
	useEffect(() => {
		if (!isLoading) {
			markdownApiRef.current?.rerender();
		}
	}, [isLoading]);

	return <Note
		note={day.note}
		onNoteChange={onNoteChange}
		saveChanges={saveChanges}
		markdownApiRef={markdownApiRef}
	/>;
}
