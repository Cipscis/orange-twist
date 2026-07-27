import type { EnumTypeOf, ExpandType } from 'utils';

export const SaveType = {
	TASK_NOTE: 'task note',
} as const;
export type SaveType = EnumTypeOf<typeof SaveType>;

interface SaveActionByType {
	[SaveType.TASK_NOTE]: {
		task: number;
		note: string;
	};
}

/**
 * This immediately indexed mapped type creates a discriminated union type of all potential save actions, discriminated by {@linkcode SaveType}.
 */
export type SaveAction = {
	[T in SaveType]: ExpandType<{ type: T; } & SaveActionByType[T]>;
}[SaveType];
