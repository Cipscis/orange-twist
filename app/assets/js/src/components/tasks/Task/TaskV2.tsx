import {
	h,
	Fragment,
	type JSX,
} from 'preact';

import { getTaskDetailUrl } from 'navigation';

import {
	IconButton,
	InlineNote,
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { useSettableTask } from 'database';
import { AsyncDataStateType } from 'utils';
import { useCallback } from 'preact/hooks';

interface TaskV2Props {
	taskId: number;
}

export const TaskV2 = (props: TaskV2Props): JSX.Element => {
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

	return <div class="task">
		{
			stateOfGet.type === AsyncDataStateType.INITIAL &&
			<Loader />
		}
		{
			stateOfGet.type === AsyncDataStateType.SUCCESS &&
				(stateOfGet.data
					? <>
						<IconButton
							href={getTaskDetailUrl(taskId)}
							title="View task"
							icon="📄"
						/>
						<InlineNote
							note={stateOfGet.data.name}
							onNoteChange={nameChangeHandler}

							placeholder="Task name"
							editButtonTitle="Edit task name"

							class="task__name"
						/>
					</>
					: <Notice
						message={`No task with ID ${taskId} exists`}
						variant={NoticeVariant.ERROR}
					/>)
		}
		{(
			stateOfGet.type === AsyncDataStateType.ERROR ||
			stateOfGet.type === AsyncDataStateType.ABORTED
		) &&
			<Notice
				message={`There was an error loading task ${taskId}`}
				variant={NoticeVariant.ERROR}
			/>
		}
	</div>;
};
