import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import {
	type TaskStatus,
	TaskStatusName,
	TaskStatusSymbol,
} from 'types/TaskStatus';

import {
	ButtonVariant,
	IconButton,
} from 'components/shared';

interface TaskStatusButtonProps {
	status: TaskStatus;
	onStatusSelect: (status: TaskStatus) => void;
}

/**
 * Display an icon button for a task status that, when clicked,
 * selects that status in some way defined by a prop.
 */
export function TaskStatusButton(props: TaskStatusButtonProps): JSX.Element {
	const {
		status,
		onStatusSelect,
	} = props;

	const statusName = TaskStatusName[status];
	const statusSymbol = TaskStatusSymbol[status];

	return <IconButton
		variant={ButtonVariant.SECONDARY}
		title={statusName}
		icon={statusSymbol}
		onClick={useCallback(() => {
			onStatusSelect(status);
		}, [status, onStatusSelect])}
		style={{
			'--colour': `var(--colour-task--${status})`,
		}}
	/>;
}
