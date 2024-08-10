import type { EnumTypeOf } from 'utils';

export const CustomEventName = {
	IMPORT_COMPLETE: 'orangetwist/importcomplete',
} as const;
export type CustomEventName = EnumTypeOf<typeof CustomEventName>;
