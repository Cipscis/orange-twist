import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import type { Status } from 'database';

import {
	ButtonVariant,
	IconButton,
} from 'components/shared';

interface StatusButtonProps {
	status: Status;
	onStatusSelect: (status: number) => void;
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

	const statusName = status.name;
	const statusIconName = status.icon;

	return <IconButton
		variant={ButtonVariant.SECONDARY}
		title={title || statusName}
		icon={statusIconName}
		onClick={useCallback(() => {
			onStatusSelect(status.id);
		}, [status, onStatusSelect])}
		style={{
			'--colour': status.colour,
		}}
	/>;
}
