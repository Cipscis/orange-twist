import type { EnumTypeOf } from 'utils';
import { IconName } from './IconName';

export const TaskStatus = {
	TODO: 'todo',
	IN_PROGRESS: 'in-progress',
	COMPLETED: 'completed',

	INVESTIGATING: 'investigating',
	IN_REVIEW: 'in-review',
	READY_TO_TEST: 'ready-to-test',
	PAUSED: 'paused',
	APPROVED_TO_DEPLOY: 'approved-to-deploy',
	WILL_NOT_DO: 'will-not-do',
} as const;
export type TaskStatus = EnumTypeOf<typeof TaskStatus>;

export const CompletedTaskStatuses: ReadonlySet<TaskStatus> = new Set([
	TaskStatus.COMPLETED,
	TaskStatus.WILL_NOT_DO,
]);

export const TaskStatusIconName = {
	[TaskStatus.TODO]: IconName.TODO,
	[TaskStatus.IN_PROGRESS]: IconName.IN_PROGRESS,
	[TaskStatus.COMPLETED]: IconName.COMPLETED,

	[TaskStatus.INVESTIGATING]: IconName.INVESTIGATING,
	[TaskStatus.IN_REVIEW]: IconName.IN_REVIEW,
	[TaskStatus.READY_TO_TEST]: IconName.TESTING,
	[TaskStatus.PAUSED]: IconName.PAUSED,
	[TaskStatus.APPROVED_TO_DEPLOY]: IconName.APPROVED,
	[TaskStatus.WILL_NOT_DO]: IconName.WILL_NOT_DO,
} as const satisfies Record<TaskStatus, IconName>;

export const TaskStatusName = {
	[TaskStatus.TODO]: 'Todo',
	[TaskStatus.IN_PROGRESS]: 'In progress',
	[TaskStatus.COMPLETED]: 'Completed',

	[TaskStatus.INVESTIGATING]: 'Investigating',
	[TaskStatus.IN_REVIEW]: 'In review',
	[TaskStatus.READY_TO_TEST]: 'Ready to test',
	[TaskStatus.PAUSED]: 'Paused',
	[TaskStatus.APPROVED_TO_DEPLOY]: 'Approved to deploy',
	[TaskStatus.WILL_NOT_DO]: 'Will not do',
} as const satisfies Record<TaskStatus, string>;
