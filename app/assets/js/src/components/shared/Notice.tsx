import { h, type JSX } from 'preact';
import {
	assertAllUnionMembersHandled,
	classNames,
	type DefaultsFor,
	type EnumTypeOf,
} from 'utils';

export const NoticeVariant = {
	ERROR: 'error',
	WARNING: 'warning',
} as const;
export type NoticeVariant = EnumTypeOf<typeof NoticeVariant>;

interface NoticeProps {
	variant?: NoticeVariant;
	message: string;
	dataTestid?: string;
}

const defaultProps = {
	variant: NoticeVariant.ERROR,
} as const satisfies DefaultsFor<
	Omit<NoticeProps, 'dataTestid'>
>;

function getVariantClass(variant: NoticeVariant): string {
	if (variant === NoticeVariant.ERROR) {
		return 'notice--error';
	} else if (variant === NoticeVariant.WARNING) {
		return 'notice--warning';
	} else {
		assertAllUnionMembersHandled(variant);
	}
}

export function Notice(props: NoticeProps): JSX.Element {
	const fullProps = {
		...defaultProps,
		...props,
	};

	const {
		variant,
		message,
		dataTestid,
	} = fullProps;

	return <div
		class={classNames('notice', getVariantClass(variant))}
		data-testid={dataTestid}
	>
		{message}
	</div>;
}
