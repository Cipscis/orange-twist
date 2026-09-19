import type { EnumTypeOf, ExpandType } from 'utils';

import type {
	Day,
	DayTask,
	Task,
} from '../types';

export const SaveType = {
	TASK: 'task',
	TASK_DELETE: 'delete task',

	// TODO: Remove this once day tasks can be saved via the day task's ID
	DAY_TASK_LEGACY: 'day task (legacy)',
	DAY_TASK: 'day task',

	// TODO: Remove this once days can be saved via the day's ID
	DAY_LEGACY: 'day (legacy)',
	// TODO: Remove this once days can be deleted via the day's ID
	DAY_DELETE_LEGACY: 'delete day (legacy)',
	DAY: 'day',
	DAY_ADD: 'add day',
	DAY_DELETE: 'delete day',
} as const;
export type SaveType = EnumTypeOf<typeof SaveType>;

interface SaveActionByType {
	[SaveType.TASK]: {
		id: number;
		task: ExpandType<Partial<
			Omit<
				Task,
				'id'
			>
		>>;
	};
	[SaveType.TASK_DELETE]: {
		id: number;
	};
	[SaveType.DAY_TASK_LEGACY]: {
		dayName: string;
		taskId: number;
		dayTask: ExpandType<Partial<
			Omit<
				DayTask,
				'id' | 'day' | 'task'
			>
		>>;
	};
	[SaveType.DAY_TASK]: {
		id: number;
		dayTask: ExpandType<Partial<
			Omit<
				DayTask,
				'id' | 'day' | 'task'
			>
		>>;
	};
	[SaveType.DAY]: {
		id: number;
		day: ExpandType<Partial<
			Omit<
				Day,
				'id' | 'year' | 'month' | 'day'
			>
		>>;
	};
	[SaveType.DAY_ADD]: {
		day: ExpandType<
			Omit<Day, 'id'>
		>;
	};
	[SaveType.DAY_DELETE]: {
		id: number;
	};
	[SaveType.DAY_LEGACY]: {
		dayName: string;
		day: ExpandType<Partial<
			Omit<
				Day,
				'id' | 'year' | 'month' | 'day'
			>
		>>;
	};
	[SaveType.DAY_DELETE_LEGACY]: {
		name: string;
	};
}

/**
 * This immediately indexed mapped type creates a discriminated union type of all potential save actions, discriminated by {@linkcode SaveType}.
 */
export type SaveAction = {
	[T in SaveType]: ExpandType<{ type: T; } & SaveActionByType[T]>;
}[SaveType];
