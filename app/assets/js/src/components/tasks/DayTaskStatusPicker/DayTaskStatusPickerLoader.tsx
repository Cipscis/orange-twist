import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils';

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

export function DayTaskStatusPickerLoader(props: DayTaskStatusPickerLoaderProps): JSX.Element {
	const {
		dayTaskDataState,
	} = props;

	if (dayTaskDataState.stateOfGet.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (dayTaskDataState.stateOfGet.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayTaskDataState.stateOfGet.error.message}
		/>;
	}

	return <DayTaskStatusPickerSync
		dayTask={dayTaskDataState.stateOfGet.data}
		setDayTask={dayTaskDataState.setData}
	/>;
}
