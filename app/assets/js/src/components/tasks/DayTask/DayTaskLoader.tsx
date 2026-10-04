import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils';

import type { useSettableDayTask } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { DayTaskSync } from './DayTaskSync';

export interface DayTaskLoaderProps {
	dayTaskDataState: ReturnType<typeof useSettableDayTask>;
}

export function DayTaskLoader(props: DayTaskLoaderProps): JSX.Element {
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

	return <DayTaskSync
		dayTask={dayTaskDataState.stateOfGet.data}
	/>;
}
