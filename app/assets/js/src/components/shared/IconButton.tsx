import { h, type JSX } from 'preact';
import { useMemo } from 'preact/hooks';

import {
	assertAllUnionMembersHandled,
	classNames,
} from 'utils';

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

// <IconButton> can contain a <button> or an <a>, so inherit from both
type IconButtonPropsBase = Omit<
	JSX.HTMLAttributes<HTMLButtonElement> & JSX.HTMLAttributes<HTMLAnchorElement
>, 'icon' | 'children'>;

interface IconButtonProps extends IconButtonPropsBase {
	class?: string;
	variant?: ButtonVariant;

	/** If set, element will be a link instead of a button */
	href?: string;

	icon: JSX.Element | string;
	title: string;
}

/**
 * Renders an icon-style button.
 */
export function IconButton(props: IconButtonProps): JSX.Element {
	const {
		icon,
		href,

		...passthroughProps
	} = props;

	const classString = classNames(
		props.class,
		getVariantClass(props.variant ?? ButtonVariant.PRIMARY),
	);

	const iconEl = useMemo(() => <span aria-hidden>{icon}</span>, [icon]);

	return href
		? <a
			href={href}
			{...passthroughProps}
			class={classString}
		>{iconEl}</a>
		: <button
			type="button"
			{...passthroughProps}
			class={classString}
		>{iconEl}</button>;
}
