import { h, type JSX } from 'preact';

import { assertAllUnionMembersHandled, classNames, type EnumTypeOf } from 'util/index';

const ButtonVariant = {
	PRIMARY: 'primary',
	SECONDARY: 'secondary',
} as const;
export type ButtonVariant = EnumTypeOf<typeof ButtonVariant>;

function getButtonVariantClass(variant: ButtonVariant): string {
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
			getButtonVariantClass(props.variant ?? ButtonVariant.PRIMARY),
		)}
	>
		{props.children}
	</button>;
}
