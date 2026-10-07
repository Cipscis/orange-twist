import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'preact/hooks';

import type { DayTask } from 'database';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import { Note, type MarkdownApi } from 'components/shared';

interface SettableDayTaskNoteSyncProps {
	dayTask: Readonly<Pick<DayTask, 'id' | 'note'>>;
	setDayTask: (date: Partial<Pick<DayTask, 'id' | 'note'>>) => Promise<void>;
}

export function SettableDayTaskNoteSync(props: SettableDayTaskNoteSyncProps): JSX.Element {
	const {
		dayTask,
		setDayTask,
	} = props;

	const { isLoading } = useContext(OrangeTwistContext);

	const setDayTaskNote = useCallback(async (note: string) => {
		await setDayTask({ note });
	}, [setDayTask]);

	const markdownApiRef = useRef<MarkdownApi | null>(null);
	// When data is finished loading re-render Markdown
	useEffect(() => {
		if (!isLoading) {
			markdownApiRef.current?.rerender();
		}
	}, [isLoading]);

	return <Note
		note={dayTask.note}
		onNoteChange={setDayTaskNote}
		markdownApiRef={markdownApiRef}
	/>;
}
