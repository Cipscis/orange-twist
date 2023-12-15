import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import * as ui from 'ui';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import {
	createTask,
	setDayTaskInfo,
	setTaskInfo,
	useAllDayTaskInfo,
	useTaskInfo,
} from 'data';

import { Note } from './shared/Note';
import { Markdown } from './shared/Markdown';

import { TaskStatusComponent } from './TaskStatusComponent';
import { Task } from './Task';
import { TaskList } from './TaskList';

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
	const dayTasksInfo = useAllDayTaskInfo({ taskId });

	const setTaskNote = useCallback(
		(note: string) => {
			setTaskInfo(taskId, { note });
		},
		[taskId]
	);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

	if (!taskInfo) {
		return null;
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
		{
			taskInfo.parent &&
			<section>
				<h2>Parent</h2>
				<Task taskId={taskInfo.parent} />
			</section>
		}
		<section>
			<h2>Children</h2>
			<TaskList
				matcher={taskInfo.children}
				onReorder={(taskIds) => {
					setTaskInfo(taskId, { children: taskIds });
					fireCommand(Command.DATA_SAVE);
				}}
			/>
			<button
				type="button"
				onClick={async () => {
					const name = await ui.prompt('Child name');
					if (name === null) {
						return;
					}

					createTask({ name, parent: taskId });
				}}
			>Create child</button>
		</section>
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
