import type { EnumTypeOf, ExpandType } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export const SaveType = {
	TASK: 'task',

	// TODO: Remove this once day tasks can be saved via the day task's ID
	DAY_TASK_LEGACY: 'day task (legacy)',
	DAY_TASK: 'day task',
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
	[SaveType.DAY_TASK_LEGACY]: {
		dayName: string;
		taskId: number;
		dayTask: ExpandType<Partial<
			Omit<
				DatabaseData[typeof ObjectStoreName.DAY_TASK][number],
				'id' | 'day' | 'task'
			>
		>>;
	};
	[SaveType.DAY_TASK]: {
		id: number;
		dayTask: ExpandType<Partial<
			Omit<
				DatabaseData[typeof ObjectStoreName.DAY_TASK][number],
				'id' | 'day' | 'task'
			>
		>>;
	};
}

/**
 * This immediately indexed mapped type creates a discriminated union type of all potential save actions, discriminated by {@linkcode SaveType}.
 */
export type SaveAction = {
	[T in SaveType]: ExpandType<{ type: T; } & SaveActionByType[T]>;
}[SaveType];
