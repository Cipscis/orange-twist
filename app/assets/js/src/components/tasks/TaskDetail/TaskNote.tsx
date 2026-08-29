import {
	h,
	Fragment,
	type JSX,
} from 'preact';
import {
	useCallback,
	useContext,
	useEffect,
	useRef,
} from 'preact/hooks';

import { AsyncDataStateType } from 'utils';

import { useSettableTask } from 'database';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import type { MarkdownApi } from 'components/shared/Markdown';
import {
	Loader,
	Note,
	Notice,
	NoticeVariant,
} from 'components/shared';

interface TaskNoteProps {
	taskId: number;
}

export function TaskNote(props: TaskNoteProps): JSX.Element {
	const { taskId } = props;

	const taskAsyncState = useSettableTask(taskId);

	const context = useContext(OrangeTwistContext);
	// Don't display a loading state while setting or re-retrieving data
	const isLoading = context.isLoading ||
		taskAsyncState.stateOfGet.type === AsyncDataStateType.INITIAL;

	const setTaskNote = useCallback(
		async (note: string) => {
			await taskAsyncState.setData({ note });
		},
		[taskAsyncState]
	);

	const markdownApiRef = useRef<MarkdownApi | null>(null);
	// When data is finished loading re-render Markdown
	useEffect(() => {
		if (!isLoading) {
			markdownApiRef.current?.rerender();
		}
	}, [isLoading]);

	return <>
		{isLoading
			? <Loader />
			: taskAsyncState.stateOfGet.type === AsyncDataStateType.SUCCESS
				? <Note
					class="task-detail__note"
					note={taskAsyncState.stateOfGet.data?.note ?? null}
					onNoteChange={setTaskNote}
					markdownApiRef={markdownApiRef}
				/>
				: <Notice
					message={`No task with ID ${taskId} exists`}
					variant={NoticeVariant.ERROR}
				/>
		}
	</>;
}
