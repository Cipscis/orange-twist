import type { EnumTypeOf } from '../EnumTypeOf';

export const AsyncActionStateType = {
	INITIAL: 'initial',
	ERROR: 'error',
	SUCCESS: 'success',
} as const;
export type AsyncActionStateType = EnumTypeOf<typeof AsyncActionStateType>;
