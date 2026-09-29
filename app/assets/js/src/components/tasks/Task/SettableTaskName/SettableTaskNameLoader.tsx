import {
	h,
	Fragment,
	type JSX,
} from 'preact';
import { useCallback } from 'preact/hooks';

import { AsyncDataStateType } from 'utils';
import {
	SaveType,
	type useSettableTask,
} from 'database';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import * as ui from 'ui';
import {
	InlineNote,
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';

import type { SettableTaskNameProps } from './SettableTaskName';
import { SettableTaskNameSync } from './SettableTaskNameSync';

interface SettableTaskNameLoaderProps extends SettableTaskNameProps {
	taskDataState: ReturnType<typeof useSettableTask>;
}

/**
 * Renders an {@linkcode InlineNote} of a specified task's name, allowing for the name to be edited.
 *
 * If the name is removed altogether, shows a prompt asking the user to confirm deleting the task.
 */
export const SettableTaskNameLoader = (props: SettableTaskNameLoaderProps): JSX.Element => {
	const {
		taskId,
		taskDataState: {
			setData,
			stateOfGet,
		},
	} = props;

	return <>
		{
			stateOfGet.type === AsyncDataStateType.INITIAL &&
			<Loader />
		}

		{
			stateOfGet.type === AsyncDataStateType.SUCCESS &&
			stateOfGet.data &&
			<SettableTaskNameSync
				task={stateOfGet.data}
				setData={setData}
			/>
		}

		{
			!(
				stateOfGet.type === AsyncDataStateType.INITIAL ||
				(
					stateOfGet.type === AsyncDataStateType.SUCCESS &&
					stateOfGet.data
				)
			) && <Notice
				variant={NoticeVariant.ERROR}
				message={`Failed to load task with ID ${taskId}`}
				dataTestid="settable-task-name__error-notice"
			/>
		}
	</>;
};
