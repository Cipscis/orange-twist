import type { EnumTypeOf } from 'utils';

export const Theme = {
	LIGHT: 'light',
	DARK: 'dark',
} as const;
export type Theme = EnumTypeOf<typeof Theme>;

const validThemes = Array.from(Object.values(Theme));
export function isTheme(val: unknown): val is Theme {
	return (validThemes as unknown[]).includes(val);
}
