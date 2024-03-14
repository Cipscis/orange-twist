import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useMemo,
} from 'preact/hooks';

import { isValidDateString } from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import {
	getDayTaskInfo,
	setDayTaskInfo,
	setTaskInfo,
	useAllDayTaskInfo,
	useTaskInfo,
} from 'data';

import * as ui from 'ui';

import {
	Button,
	Loader,
	Markdown,
	Note,
	Notice,
} from 'components/shared';

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
	const unsortedDayTasksInfo = useAllDayTaskInfo({ taskId });

	const dayTasksInfo = useMemo(() => unsortedDayTasksInfo.toSorted(
		({ dayName: dayNameA }, { dayName: dayNameB }) => dayNameA.localeCompare(dayNameB)
	), [unsortedDayTasksInfo]);

	const setTaskNote = useCallback(
		(note: string) => {
			setTaskInfo(taskId, { note });
		},
		[taskId]
	);

	const saveChanges = useCallback(() => fireCommand(Command.DATA_SAVE), []);

	const addNewDayTask = useCallback(async () => {
		const dayName = await ui.prompt('What day?');
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			ui.alert('Invalid day');
			return;
		}

		const existingDayData = getDayTaskInfo({ taskId, dayName });
		if (existingDayData) {
			ui.alert('Day already exists');
			return;
		}

		setDayTaskInfo({ dayName, taskId }, {});
		fireCommand(Command.DATA_SAVE);
	}, [taskId]);

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
			<DayTaskDetail
				key={dayTaskInfo.dayName}
				dayTaskInfo={dayTaskInfo}
				open={i === arr.length-1}
			/>
		))}

		<Button
			onClick={addNewDayTask}
		>Add day</Button>
	</section>;
}
