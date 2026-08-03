import type { EnumTypeOf, ExpandType } from 'utils';

export const SaveType = {
	TASK_NOTE: 'task note',

	// TODO: Remove this once day task notes can be saved via the day task's ID
	DAY_TASK_NOTE_LEGACY: 'day task note (legacy)',
	DAY_TASK_NOTE: 'day task note',
} as const;
export type SaveType = EnumTypeOf<typeof SaveType>;

interface SaveActionByType {
	[SaveType.TASK_NOTE]: {
		task: number;
		note: string;
	};
	[SaveType.DAY_TASK_NOTE_LEGACY]: {
		dayName: string;
		taskId: number;
		note: string;
	};
	[SaveType.DAY_TASK_NOTE]: {
		dayTask: number;
		note: string;
	};
}

/**
 * This immediately indexed mapped type creates a discriminated union type of all potential save actions, discriminated by {@linkcode SaveType}.
 */
export type SaveAction = {
	[T in SaveType]: ExpandType<{ type: T; } & SaveActionByType[T]>;
}[SaveType];
