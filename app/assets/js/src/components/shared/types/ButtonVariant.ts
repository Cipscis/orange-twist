import type { EnumTypeOf } from 'util/index';

export const ButtonVariant = {
	PRIMARY: 'primary',
	SECONDARY: 'secondary',
} as const;
export type ButtonVariant = EnumTypeOf<typeof ButtonVariant>;
