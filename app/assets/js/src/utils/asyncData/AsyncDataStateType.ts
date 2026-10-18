import type { EnumTypeOf } from '../EnumTypeOf';

export const AsyncDataStateType = {
	INITIAL: 'initial',
	ERROR: 'error',
	SUCCESS: 'success',
} as const;
export type AsyncDataStateType = EnumTypeOf<typeof AsyncDataStateType>;
