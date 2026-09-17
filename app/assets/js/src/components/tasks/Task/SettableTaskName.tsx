import {
	h,
	Fragment,
	type JSX,
} from 'preact';
import { useCallback } from 'preact/hooks';

import { AsyncDataStateType } from 'utils';
import { useSettableTask } from 'database';

import {
	InlineNote,
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';

interface SettableTaskNameProps {
	taskId: number;
}

export const SettableTaskName = (props: SettableTaskNameProps): JSX.Element => {
	const {
		taskId,
	} = props;

	const {
		setData,
		stateOfGet,
	} = useSettableTask(taskId);

	const nameChangeHandler = useCallback((name: string) => {
		setData({ name });
	}, [setData]);

	return <>
		{
			stateOfGet.type === AsyncDataStateType.INITIAL &&
			<Loader />
		}

		{
			stateOfGet.type === AsyncDataStateType.SUCCESS &&
			stateOfGet.data &&
			<InlineNote
				note={stateOfGet.data.name}
				onNoteChange={nameChangeHandler}

				placeholder="Task name"
				editButtonTitle="Edit task name"

				class="task__name"
			/>
		}

		{
			!(
				stateOfGet.type === AsyncDataStateType.INITIAL ||
				(
					stateOfGet.type === AsyncDataStateType.SUCCESS &&
					stateOfGet.data
				)
			) && <Notice variant={NoticeVariant.ERROR} message={`Failed to load task ${taskId}`} />
		}
	</>;
};
