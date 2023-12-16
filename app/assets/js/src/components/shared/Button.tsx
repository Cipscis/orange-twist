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

// <Button> can contain a <button> or an <a>, so inherit from both
type ButtonPropsBase = JSX.HTMLAttributes<HTMLButtonElement> &
	JSX.HTMLAttributes<HTMLAnchorElement>;

interface ButtonProps extends ButtonPropsBase {
	class?: string;
	variant?: ButtonVariant;

	href?: string;
}

export function Button(props: ButtonProps): JSX.Element {
	const {
		href,

		...passthroughProps
	} = props;

	const classString = classNames(
		props.class,
		getVariantClass(props.variant ?? ButtonVariant.PRIMARY),
	);

	return href
		? <a
			href={href}
			{...passthroughProps}
			class={classString}
		>
			{props.children}
		</a>
		: <button
			type="button"
			{...passthroughProps}
			class={classString}
		>
			{props.children}
		</button>;
}
