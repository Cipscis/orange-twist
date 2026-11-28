import { h, type JSX } from 'preact';

import { AsyncActionStateType } from 'utils/asyncAction';

import type { useSettableDayTask } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { DayTaskStatusPickerSync } from './DayTaskStatusPickerSync';

export interface DayTaskStatusPickerLoaderProps {
	dayTaskDataState: ReturnType<typeof useSettableDayTask>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving day task information. If day task information is loaded, uses it to render a status picker for that day task.
 */
export function DayTaskStatusPickerLoader(props: DayTaskStatusPickerLoaderProps): JSX.Element {
	const {
		dayTaskDataState,
	} = props;

	if (dayTaskDataState.getterState.type === AsyncActionStateType.INITIAL) {
		return <Loader />;
	}

	if (dayTaskDataState.getterState.type === AsyncActionStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayTaskDataState.getterState.error.message}
		/>;
	}

	return <DayTaskStatusPickerSync
		dayTask={dayTaskDataState.getterState.data}
		setDayTask={dayTaskDataState.setData}
	/>;
}
