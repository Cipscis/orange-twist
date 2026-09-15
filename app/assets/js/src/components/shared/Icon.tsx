import { h, type JSX } from 'preact';

import { IconName } from '../../types/IconName';

export interface IconProps {
	name: IconName;
	title: string | null;
}

const iconNameMap = {
	[IconName.TODO]: 'checkbox-empty.svg',
	[IconName.IN_PROGRESS]: 'triangle-solid-right.svg',
	[IconName.COMPLETED]: 'checkbox-filled.svg',
	[IconName.INVESTIGATING]: 'magnifying-glass.svg',
	[IconName.IN_REVIEW]: 'eye.svg',
	[IconName.TESTING]: 'test-tube.svg',
	[IconName.PAUSED]: 'paused.svg',
	[IconName.APPROVED]: 'thumbs-up.svg',
	[IconName.WILL_NOT_DO]: 'crossed-circle.svg',

	[IconName.CHEVRON_UP]: 'chevron-up.svg',
	[IconName.CHEVRON_RIGHT]: 'chevron-right.svg',
	[IconName.CHEVRON_DOWN]: 'chevron-down.svg',
	[IconName.CHEVRON_LEFT]: 'chevron-left.svg',

	[IconName.FILE]: 'file-lines.svg',
	[IconName.EDIT]: 'pencil-in-square.svg',
	[IconName.DELETE]: 'rubbish-bin.svg',
	[IconName.CLOSE]: 'cross.svg',
} as const satisfies Record<IconName, string>;

export const Icon = (props: IconProps): JSX.Element => {
	const {
		name,
		title,
	} = props;

	const iconPath = iconNameMap[name];

	return <span
		class="icon"
		style={{
			maskImage: `url("/assets/images/icons/${iconPath}")`,
		}}
		title={title ?? undefined}
	/>;
};
