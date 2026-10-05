import type { EnumTypeOf, ExpandType } from 'utils';

import type {
	Day,
	DayTask,
	Task,
} from '../types';
import type { addDayTaskInternal, addTaskInternal } from '../internal';

export const SaveType = {
	TASK: 'task',
	TASK_ADD: 'add task',
	TASK_ADD_WITH_DAY: 'add task to day',
	TASK_DELETE: 'delete task',

	// TODO: Remove this once day tasks can be saved via the day task's ID
	DAY_TASK_LEGACY: 'day task (legacy)',
	DAY_TASK: 'day task',
	DAY_TASK_ADD: 'add day task',
	DAY_TASK_DELETE: 'delete day task',

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
	[SaveType.TASK_ADD]: {
		task: Parameters<typeof addTaskInternal>[1];
	};
	[SaveType.TASK_ADD_WITH_DAY]: {
		task: Parameters<typeof addTaskInternal>[1];
		dayId: number;
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
	[SaveType.DAY_TASK_ADD]: {
		dayTask: Parameters<typeof addDayTaskInternal>[1];
	};
	[SaveType.DAY_TASK_DELETE]: {
		id: number;
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
}

/**
 * This immediately indexed mapped type creates a discriminated union type of all potential save actions, discriminated by {@linkcode SaveType}.
 */
export type SaveAction = {
	[T in SaveType]: ExpandType<{ type: T; } & SaveActionByType[T]>;
}[SaveType];
