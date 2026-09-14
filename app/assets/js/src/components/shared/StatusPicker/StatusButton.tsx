import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import {
	type TaskStatus,
	TaskStatusName,
	TaskStatusIconName,
} from 'types/TaskStatus';

import {
	ButtonVariant,
	IconButton,
} from 'components/shared';

interface StatusButtonProps {
	status: TaskStatus;
	onStatusSelect: (status: TaskStatus) => void;
	title?: string;
}

/**
 * Display an icon button for a status that, when clicked,
 * selects that status in some way defined by a prop.
 */
export function StatusButton(props: StatusButtonProps): JSX.Element {
	const {
		status,
		onStatusSelect,
		title,
	} = props;

	const statusName = TaskStatusName[status];
	const statusIconName = TaskStatusIconName[status];

	return <IconButton
		variant={ButtonVariant.SECONDARY}
		title={title || statusName}
		icon={statusIconName}
		onClick={useCallback(() => {
			onStatusSelect(status);
		}, [status, onStatusSelect])}
		style={{
			'--colour': `var(--colour-task--${status})`,
		}}
	/>;
}
