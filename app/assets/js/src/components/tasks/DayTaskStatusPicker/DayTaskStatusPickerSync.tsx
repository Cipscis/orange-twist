import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { SaveType, type DayTask } from 'database';

import { StatusPicker } from 'components/shared';
import * as ui from 'ui';
import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

export interface DayTaskStatusPickerSyncProps {
	dayTask: DayTask;
	setDayTask: (data: Partial<DayTask>) => Promise<void>;
}

export function DayTaskStatusPickerSync(props: DayTaskStatusPickerSyncProps): JSX.Element {
	const {
		dayTask,
		setDayTask,
	} = props;

	const setDayTaskStatus = useCallback((status: number) => {
		setDayTask({ status });
	}, [setDayTask]);

	/**
	 * Ask for confirmation, then remove this day task.
	 */
	const removeTaskFromDay = useCallback(async () => {
		if (!await ui.confirm(`Are you sure you want to remove this day task?`)) {
			return;
		}

		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.DAY_TASK_DELETE,
			id: dayTask.id,
		}]);
	}, [dayTask]);

	return <StatusPicker
		status={dayTask.status}

		onStatusSelect={setDayTaskStatus}
		deleteButtonTitle="Remove task from day"
		onDelete={removeTaskFromDay}
	/>;
}
