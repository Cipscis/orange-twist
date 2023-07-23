import { DayList } from './types/DayList.js';
import { TaskStatus } from './types/TaskStatus.js';

const dayList: DayList = {
	days: [
		{
			date: new Date(2023, 7, 23),
			tasks: [
				{
					id: 1,
					name: 'Example task 2',
					notes: [],
					status: TaskStatus.IN_PROGRESS,
				},
			],
		},
	],

	unfinished: [
		{
			id: 0,
			name: 'Example task',
			notes: [],
			status: TaskStatus.TODO,
		},
	],
};

console.log(dayList);
