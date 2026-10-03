import h, { type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import type { DayTask } from 'database';

import { StatusPicker } from 'components/shared';
import * as ui from 'ui';

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

	// TODO: Update to use a specific save action
	/**
	 * Ask for confirmation, then remove a task from this component's day.
	 */
	// const removeTaskFromDay = useCallback(async () => {
	// 	if (!await ui.confirm(`Are you sure you want to remove this day task?`)) {
	// 		return;
	// 	}

	// 	deleteDayTask({ dayName, taskId });
	// 	fireCommand(Command.DATA_SAVE);
	// }, []);

	return <StatusPicker
		status={dayTask.status}

		onStatusSelect={setDayTaskStatus}
		deleteButtonTitle="Remove task from day"
		// TODO
		// onDelete={removeTaskFromDay}
		onDelete={() => {}}
	/>;
}
