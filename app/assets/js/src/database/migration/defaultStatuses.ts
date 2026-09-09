import { IconName } from 'types/IconName';

import type { Status } from '../types';

export const defaultStatuses = [
	{
		id: 1,
		alias: 'todo',
		name: 'Todo',
		icon: IconName.TODO,
		colour: 'var(--blue)',
		completed: false,
	},
	{
		id: 2,
		alias: 'in-progress',
		name: 'In progress',
		icon: IconName.IN_PROGRESS,
		colour: 'var(--blue)',
		completed: false,
	},
	{
		id: 3,
		alias: 'completed',
		name: 'Completed',
		icon: IconName.COMPLETED,
		colour: 'var(--green)',
		completed: true,
	},
	{
		id: 4,
		alias: 'investigating',
		name: 'Investigating',
		icon: IconName.INVESTIGATING,
		colour: 'var(--blue)',
		completed: false,
	},
	{
		id: 5,
		alias: 'in-review',
		name: 'In review',
		icon: IconName.IN_REVIEW,
		colour: 'var(--blue)',
		completed: false,
	},
	{
		id: 6,
		alias: 'ready-to-test',
		name: 'Testing',
		icon: IconName.TESTING,
		colour: 'var(--green)',
		completed: false,
	},
	{
		id: 7,
		alias: 'paused',
		name: 'Paused',
		icon: IconName.PAUSED,
		colour: 'var(--red)',
		completed: false,
	},
	{
		id: 8,
		alias: 'approved-to-deploy',
		name: 'Approved',
		icon: IconName.APPROVED,
		colour: 'var(--green)',
		completed: true,
	},
	{
		id: 9,
		alias: 'will-not-do',
		name: 'Will not do',
		icon: IconName.WILL_NOT_DO,
		colour: 'var(--red)',
		completed: true,
	},
] as const satisfies Status[];
