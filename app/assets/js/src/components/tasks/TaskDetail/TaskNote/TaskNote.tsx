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
import { TaskNoteLoader } from './TaskNoteLoader';

export interface TaskNoteProps {
	taskId: number;
}

export function TaskNote(props: TaskNoteProps): JSX.Element {
	const { taskId } = props;

	const taskDataState = useSettableTask(taskId);

	return <TaskNoteLoader
		taskId={taskId}
		taskDataState={taskDataState}
	/>;
}
