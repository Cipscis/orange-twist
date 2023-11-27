import type { EnumTypeOf } from 'util/index';

export const TaskStatus = {
	TODO: 'todo',
	IN_PROGRESS: 'in-progress',
	COMPLETED: 'completed',

	INVESTIGATING: 'investigating',
	IN_REVIEW: 'in-review',
	READY_TO_TEST: 'ready-to-test',
	APPROVED_TO_DEPLOY: 'approved-to-deploy',
	WILL_NOT_DO: 'will-not-do',
} as const;
export type TaskStatus = EnumTypeOf<typeof TaskStatus>;

export const CompletedTaskStatuses: ReadonlySet<TaskStatus> = new Set([
	TaskStatus.COMPLETED,
	TaskStatus.WILL_NOT_DO,
]);
