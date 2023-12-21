import { h, type JSX } from 'preact';
import { useCallback, useContext } from 'preact/hooks';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import {
	setTaskInfo,
	useAllDayTaskInfo,
	useTaskInfo,
} from 'data';

import { Note } from '../../shared/Note';
import { Markdown } from '../../shared/Markdown';
import { Notice } from '../../shared/Notice';
import { Loader } from '../../shared/Loader';

import { OrangeTwistContext } from 'components/OrangeTwistContext';
import { DayTaskDetail } from './DayTaskDetail';

interface TaskDetailProps {
	taskId: number;
}

/**
 * Renders a detailed view for a task, including its notes.
 */
export function TaskDetail(props: TaskDetailProps): JSX.Element | null {
	const {
		taskId,
	} = props;

	const {
		isLoading,
	} = useContext(OrangeTwistContext);

	const taskInfo = useTaskInfo(taskId);
	const dayTasksInfo = useAllDayTaskInfo({ taskId });

	const setTaskNote = useCallback(
		(note: string) => {
			setTaskInfo(taskId, { note });
		},
		[taskId]
	);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

	if (isLoading) {
		return <Loader />;
	}

	if (!taskInfo) {
		return <Notice
			message={`No task with ID ${taskId} exists`}
		/>;
	}

	return <section class="orange-twist__section">
		<Markdown
			content={`## ${taskInfo.name}`}
			inline
		/>
		<Note
			class="task-detail__note"
			note={taskInfo.note}
			onNoteChange={setTaskNote}
			saveChanges={saveChanges}
		/>
		{dayTasksInfo.map((dayTaskInfo, i, arr) => (
			<details
				key={dayTaskInfo.dayName}
				class="day"
				open={i === arr.length-1}
			>
				<summary class="day__summary">
					<h3 class="day__heading">{dayTaskInfo.dayName}</h3>
				</summary>

				<div class="day__body">
					<DayTaskDetail
						dayTaskInfo={dayTaskInfo}
					/>
				</div>
			</details>
		))}
	</section>;
}
