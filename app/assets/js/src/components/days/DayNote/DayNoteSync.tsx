import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import type { Day } from 'database';

import { Note } from 'components/shared';

interface DayNoteSyncProps {
	day: Readonly<Pick<
		Day, 'id' | 'note'
	>>;
	setDay: (data: Partial<Pick<Day, 'note'>>) => Promise<void>;
}

/**
 * Renders a note for a specified day, including the ability to
 * edit that note.
 */
export function DayNoteSync(props: DayNoteSyncProps): JSX.Element {
	const {
		day,
		setDay,
	} = props;

	const onNoteChange = useCallback(
		(note: string) => {
			setDay({ note });
		},
		[setDay]
	);

	return <Note
		note={day.note}
		onNoteChange={onNoteChange}
	/>;
}
