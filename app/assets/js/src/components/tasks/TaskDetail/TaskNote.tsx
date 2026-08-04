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

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { setTaskInfo } from 'data';
import { SaveType, useTask } from 'database';

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

	const taskAsyncState = useTask(taskId);

	const context = useContext(OrangeTwistContext);
	const isLoading = context.isLoading ||
		taskAsyncState.type === AsyncDataStateType.INITIAL ||
		taskAsyncState.type === AsyncDataStateType.LOADING;

	/** Keep a reference to the note for immediate saving before re-renredering. */
	const noteRef = useRef('');
	// Make sure to update the ref if the task note changes from other sources
	useEffect(() => {
		if (taskAsyncState.type === AsyncDataStateType.SUCCESS) {
			noteRef.current = taskAsyncState.data?.note ?? '';
		} else {
			noteRef.current = '';
		}
	}, [taskAsyncState]);

	const setTaskNote = useCallback(
		(note: string) => {
			noteRef.current = note;
			setTaskInfo(taskId, { note });
		},
		[taskId]
	);

	const saveChanges = useCallback(() => {
		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.TASK,
			id: taskId,
			task: { note: noteRef.current },
		}]);
	}, [taskId]);

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
			: (
				taskAsyncState.type === AsyncDataStateType.SUCCESS &&
				taskAsyncState.data
			)
				? <Note
					class="task-detail__note"
					note={taskAsyncState.data.note}
					onNoteChange={setTaskNote}
					saveChanges={saveChanges}
					markdownApiRef={markdownApiRef}
				/>
				: <Notice
					message={`No task with ID ${taskId} exists`}
					variant={NoticeVariant.ERROR}
				/>
		}
	</>;
}
