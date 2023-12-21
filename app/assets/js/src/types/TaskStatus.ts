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

export const TaskStatusSymbol = {
	[TaskStatus.TODO]: '☐',
	[TaskStatus.IN_PROGRESS]: '▶️',
	[TaskStatus.COMPLETED]: '☑️',

	[TaskStatus.INVESTIGATING]: '🔍',
	[TaskStatus.IN_REVIEW]: '👀',
	[TaskStatus.READY_TO_TEST]: '🧪',
	[TaskStatus.APPROVED_TO_DEPLOY]: '🟢',
	[TaskStatus.WILL_NOT_DO]: '🚫',
} as const satisfies Record<TaskStatus, string>;

export const TaskStatusName = {
	[TaskStatus.TODO]: 'Todo',
	[TaskStatus.IN_PROGRESS]: 'In progress',
	[TaskStatus.COMPLETED]: 'Completed',

	[TaskStatus.INVESTIGATING]: 'Investigating',
	[TaskStatus.IN_REVIEW]: 'In review',
	[TaskStatus.READY_TO_TEST]: 'Ready to test',
	[TaskStatus.APPROVED_TO_DEPLOY]: 'Approved to deploy',
	[TaskStatus.WILL_NOT_DO]: 'Will not do',
} as const satisfies Record<TaskStatus, string>;
