import {
	h,
	Fragment,
	type JSX,
} from 'preact';

import { AsyncActionStateType } from 'utils/asyncData';
import type { useSettableTask } from 'database';

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
			getterState,
		},
	} = props;

	return <>
		{
			getterState.type === AsyncActionStateType.INITIAL &&
			<Loader />
		}

		{
			getterState.type === AsyncActionStateType.SUCCESS &&
			getterState.data &&
			<SettableTaskNameSync
				task={getterState.data}
				setData={setData}
			/>
		}

		{
			!(
				getterState.type === AsyncActionStateType.INITIAL ||
				(
					getterState.type === AsyncActionStateType.SUCCESS &&
					getterState.data
				)
			) && <Notice
				variant={NoticeVariant.ERROR}
				message={`Failed to load task with ID ${taskId}`}
				dataTestid="settable-task-name__error-notice"
			/>
		}
	</>;
};
