import { h, type JSX } from 'preact';

import {
	assertAllUnionMembersHandled,
	classNames,
} from 'util/index';

import { ButtonVariant } from './types';

function getVariantClass(variant: ButtonVariant): string {
	if (variant === ButtonVariant.PRIMARY) {
		return 'button--primary';
	} else if (variant === ButtonVariant.SECONDARY) {
		return 'button--secondary';
	} else {
		assertAllUnionMembersHandled(variant);
	}
}

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
	class?: string;
	variant?: ButtonVariant;
}

export function Button(props: ButtonProps): JSX.Element {
	return <button
		type="button"
		{...props}
		class={classNames(
			props.class,
			getVariantClass(props.variant ?? ButtonVariant.PRIMARY),
		)}
	>
		{props.children}
	</button>;
}