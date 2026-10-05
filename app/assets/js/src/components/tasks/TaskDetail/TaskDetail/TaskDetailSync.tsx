import { h, type JSX } from 'preact';
import {
	useCallback,
	useMemo,
} from 'preact/hooks';

import { getCurrentDateDayName, isValidDateString } from 'utils';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import {
	getDayTaskInfo,
	setDayTaskInfo,
	useAllDayTaskInfo,
} from 'data';
import {
	getDayNameParts,
	loadDayByDate,
	loadDayTaskForDayAndTask,
	SaveType,
	type Task,
} from 'database';

import * as ui from 'ui';

import {
	Button,
	Markdown,
} from 'components/shared';

import { DayTaskDetail } from '../DayTaskDetail';
import { TaskNote } from '../TaskNote';

interface TaskDetailSyncProps {
	task: Task;
	setTask: (data: Partial<Task>) => Promise<void>;
}

/**
 * Renders a detailed view for a task, including its notes.
 */
export function TaskDetailSync(props: TaskDetailSyncProps): JSX.Element | null {
	const {
		task,
	} = props;

	const unsortedDayTasksInfo = useAllDayTaskInfo({ taskId: task.id });

	const dayTasksInfo = useMemo(() => unsortedDayTasksInfo.toSorted(
		({ dayName: dayNameA }, { dayName: dayNameB }) => dayNameA.localeCompare(dayNameB)
	), [unsortedDayTasksInfo]);

	/**
	 * Prompt the user for which day to add a day task for. If a day task exists on that day, show an error. Otherwise, construct a day if necessary and then construct a day task too.
	 */
	const addNewDayTask = useCallback(async () => {
		const dayName = await ui.prompt('What day?', { type: ui.PromptType.DATE });
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			ui.alert(`Invalid day ${dayName}`);
			return;
		}

		const [year, month, day] = getDayNameParts(dayName);
		const existingDay = await loadDayByDate({ year, month, day });

		const existingDayTask = existingDay && await loadDayTaskForDayAndTask({
			day: existingDay.id,
			task: task.id,
		});
		if (existingDayTask) {
			ui.alert(`Day ${dayName} already exists`);
			return;
		}

		if (existingDay) {
			// If the day does exist, just create the day task
			fireCommand(Command.DATA_SAVE, [{
				type: SaveType.DAY_TASK_ADD,
				dayTask: {
					day: existingDay.id,
					task: task.id,
				},
			}]);
			return;
		}

		// TODO: If the day doesn't exist, create it and the day task with it

		const existingDayData = getDayTaskInfo({ taskId: task.id, dayName });
		if (existingDayData) {
			ui.alert(`Day ${dayName} already exists`);
			return;
		}

		setDayTaskInfo({ dayName, taskId: task.id }, {});
		fireCommand(Command.DATA_SAVE);
	}, [task.id]);

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

	return <section class="orange-twist__section">
		<Markdown
			content={`## ${task.name}`}
			inline
		/>
		<TaskNote taskId={task.id} />
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
