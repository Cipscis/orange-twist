import type { EnumTypeOf, ExpandType } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export const SaveType = {
	TASK: 'task',

	// TODO: Remove this once day task notes can be saved via the day task's ID
	DAY_TASK_NOTE_LEGACY: 'day task note (legacy)',
	DAY_TASK_NOTE: 'day task note',
} as const;
export type SaveType = EnumTypeOf<typeof SaveType>;

interface SaveActionByType {
	[SaveType.TASK]: {
		id: number;
		task: ExpandType<Partial<
			Omit<
				DatabaseData[typeof ObjectStoreName.TASK][number],
				'id'
			>
		>>;
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
