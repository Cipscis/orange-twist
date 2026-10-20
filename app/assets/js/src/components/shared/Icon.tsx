import { h, type JSX } from 'preact';

import type { IconName } from '../../types/IconName';

export interface IconProps {
	name: IconName;
	title: string | null;
}

export const Icon = (props: IconProps): JSX.Element => {
	const {
		name,
		title,
	} = props;

	return <span
		class="icon"
		style={{
			'--icon': name,
		}}
		title={title ?? undefined}
	>
		<span
			class="icon__mask"
		/>
	</span>;
};
