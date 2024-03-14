import type { EnumTypeOf } from 'utils';

export const ButtonVariant = {
	PRIMARY: 'primary',
	SECONDARY: 'secondary',
} as const;
export type ButtonVariant = EnumTypeOf<typeof ButtonVariant>;
