import { h, type JSX } from 'preact';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { useTaskInfo } from 'data/tasks';
import { setDayTaskInfo, useDayTaskInfo } from 'data/dayTasks';

import { Note } from './shared/Note';
import { Markdown } from './shared/Markdown';

import { TaskStatusComponent } from './TaskStatusComponent';

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

	const taskInfo = useTaskInfo(taskId);
	const dayTasksInfo = useDayTaskInfo({ taskId });

	if (!taskInfo) {
		return null;
	}

	return <section class="orange-twist__section">
		<Markdown
			class="orange-twist__title"
			content={`## ${taskInfo.name}`}
			inline
		/>
		{dayTasksInfo.map(({ dayName, taskId, note }, i, arr) => (
			<details
				key={dayName}
				class="day"
				open={i === arr.length-1}
			>
				<summary class="day__summary">
					<h3 class="day__heading">{dayName}</h3>
				</summary>

				<div class="day__body">
					<TaskStatusComponent
						taskId={taskId}
						dayName={dayName}
					/>
					<Note
						note={note}
						onNoteChange={(note) => setDayTaskInfo({ dayName, taskId }, { note })}
						saveChanges={() => fireCommand(Command.DATA_SAVE)}
					/>
				</div>
			</details>
		))}
	</section>;
}
