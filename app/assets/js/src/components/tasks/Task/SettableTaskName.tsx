import {
	h,
	Fragment,
	type JSX,
} from 'preact';

import { useSettableTask } from 'database';
import { AsyncDataStateType } from 'utils';
import { InlineNote, Loader } from 'components/shared';
import { useCallback } from 'preact/hooks';

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

		{/* TODO: What if no data? */}

		{/* TODO: What if error or aborted? */}
	</>;
};
