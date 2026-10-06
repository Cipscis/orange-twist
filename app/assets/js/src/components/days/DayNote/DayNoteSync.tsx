import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'preact/hooks';

import type { Day } from 'database';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import { Note, type MarkdownApi } from 'components/shared';

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

	const { isLoading } = useContext(OrangeTwistContext);

	const onNoteChange = useCallback(
		(note: string) => {
			setDay({ note });
		},
		[setDay]
	);

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
		markdownApiRef={markdownApiRef}
	/>;
}
