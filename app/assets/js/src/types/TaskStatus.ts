import type { EnumTypeOf } from '../util';

export const TaskStatus = {
	TODO: 'todo',
	IN_PROGRESS: 'in-progress',
	COMPLETED: 'completed',
} as const;
export type TaskStatus = EnumTypeOf<typeof TaskStatus>;
