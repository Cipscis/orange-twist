import { IconName } from 'types/IconName';

import type { Status } from '../types';

export const defaultStatuses = [
	{
		id: 1,
		name: 'Todo',
		icon: IconName.TODO,
		colour: 'var(--blue)',
		completed: false,
	},
	{
		id: 2,
		name: 'In progress',
		icon: IconName.IN_PROGRESS,
		colour: 'var(--blue)',
		completed: false,
	},
	{
		id: 3,
		name: 'Completed',
		icon: IconName.COMPLETED,
		colour: 'var(--green)',
		completed: true,
	},
	{
		id: 4,
		name: 'Investigating',
		icon: IconName.INVESTIGATING,
		colour: 'var(--blue)',
		completed: false,
	},
	{
		id: 5,
		name: 'In review',
		icon: IconName.IN_REVIEW,
		colour: 'var(--blue)',
		completed: false,
	},
	{
		id: 6,
		name: 'Testing',
		icon: IconName.TESTING,
		colour: 'var(--green)',
		completed: false,
	},
	{
		id: 7,
		name: 'Paused',
		icon: IconName.PAUSED,
		colour: 'var(--red)',
		completed: false,
	},
	{
		id: 8,
		name: 'Approved',
		icon: IconName.APPROVED,
		colour: 'var(--green)',
		completed: false,
	},
	{
		id: 9,
		name: 'Will not do',
		icon: IconName.WILL_NOT_DO,
		colour: 'var(--red)',
		completed: true,
	},
] as const satisfies Status[];
