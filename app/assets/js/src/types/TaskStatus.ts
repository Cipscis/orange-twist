import { EnumTypeOf } from '@cipscis/ts-toolbox';

export const TaskStatus = {
	TODO: 'todo',
	IN_PROGRESS: 'in-progress',
	COMPLETED: 'completed',
} as const;
export type TaskStatus = EnumTypeOf<typeof TaskStatus>;
