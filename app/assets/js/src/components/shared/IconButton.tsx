import { h, type JSX } from 'preact';
import { useMemo } from 'preact/hooks';

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

// <IconButton> can contain different tag types, so inherit from the base `HTMLElement`
type IconButtonPropsBase = Omit<
	JSX.HTMLAttributes<HTMLElement>,
	'icon' | 'children' | 'ref'
>;

interface IconButtonProps extends IconButtonPropsBase {
	class?: string;
	variant?: ButtonVariant;

	/** If set, element will be a link instead of a button. */
	href?: string;

	icon: JSX.Element | string;
	title: string;

	/** If `true`, will render a disabled button or text instead of a link. */
	disabled?: boolean;
}

/**
 * Renders an icon-style button.
 */
export function IconButton(props: IconButtonProps): JSX.Element {
	const {
		icon,
		href,
		disabled,

		...passthroughProps
	} = props;

	const classString = classNames(
		props.class,
		getVariantClass(props.variant ?? ButtonVariant.PRIMARY),
	);

	const iconEl = useMemo(() => <span aria-hidden>{icon}</span>, [icon]);

	if (href) {
		if (disabled) {
			return <span
				aria-disabled={disabled}
				{...passthroughProps}
				class={classString}
			>{iconEl}</span>;
		} else {
			return <a
				href={href}
				{...passthroughProps}
				class={classString}
			>{iconEl}</a>;
		}
	} else {
		return <button
			type="button"
			disabled={disabled}
			{...passthroughProps}
			class={classString}
		>{iconEl}</button>
	}
}
