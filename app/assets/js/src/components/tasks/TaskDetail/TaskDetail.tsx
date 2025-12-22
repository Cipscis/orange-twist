import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useMemo,
} from 'preact/hooks';

import { getCurrentDateDayName, isValidDateString } from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import {
	getDayTaskInfo,
	setDayTaskInfo,
	useAllDayTaskInfo,
	useTaskInfo,
} from 'data';

import * as ui from 'ui';

import {
	Button,
	Loader,
	Markdown,
	Notice,
} from 'components/shared';

import { OrangeTwistContext } from 'components/OrangeTwistContext';
import { DayTaskDetail } from './DayTaskDetail';
import { TaskNote } from './TaskNote';

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

	const addNewDayTask = useCallback(async () => {
		const dayName = await ui.prompt('What day?', { type: ui.PromptType.DATE });
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			ui.alert(`Invalid day ${dayName}`);
			return;
		}

		const existingDayData = getDayTaskInfo({ taskId, dayName });
		if (existingDayData) {
			ui.alert(`Day ${dayName} already exists`);
			return;
		}

		setDayTaskInfo({ dayName, taskId }, {});
		fireCommand(Command.DATA_SAVE);
	}, [taskId]);

	const currentDayName = getCurrentDateDayName();

	const expandedDayTaskIndex = useMemo(
		() => {
			// If the day tasks list includes the current day, expand it
			const currentDayIndex = dayTasksInfo.findIndex(
				({ dayName }) => dayName === currentDayName
			);

			if (currentDayIndex !== -1) {
				return currentDayIndex;
			}

			// Otherwise, expand the last day task
			return dayTasksInfo.length - 1;
		},
		[dayTasksInfo, currentDayName]
	);

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
		<TaskNote task={taskInfo} />
		{dayTasksInfo.map((dayTaskInfo, i, arr) => (
			<DayTaskDetail
				key={dayTaskInfo.dayName}
				dayTaskInfo={dayTaskInfo}
				open={i === expandedDayTaskIndex}
			/>
		))}

		<Button
			onClick={addNewDayTask}
		>Add day</Button>
	</section>;
}
