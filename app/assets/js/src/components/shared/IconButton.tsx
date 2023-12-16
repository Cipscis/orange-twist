import { h, type JSX } from 'preact';

import {
	assertAllUnionMembersHandled,
	classNames,
} from 'util/index';

import { ButtonVariant } from './types';

function getVariantClass(variant: ButtonVariant): string {
	if (variant === ButtonVariant.PRIMARY) {
		return 'icon-button--primary';
	} else if (variant === ButtonVariant.SECONDARY) {
		return 'icon-button--secondary';
	} else {
		assertAllUnionMembersHandled(variant);
	}
}

interface IconButtonProps extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, 'icon' | 'children'> {
	class?: string;
	variant?: ButtonVariant;

	icon: JSX.Element | string;
	title: string;
}

export function IconButton(props: IconButtonProps): JSX.Element {
	const {
		icon,

		...passthroughProps
	} = props;

	return <button
		type="button"
		{...passthroughProps}
		class={classNames(
			props.class,
			getVariantClass(props.variant ?? ButtonVariant.PRIMARY),
		)}
	>
		<span aria-hidden>{icon}</span>
	</button>;
}
