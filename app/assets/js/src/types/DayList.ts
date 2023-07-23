import { Day } from './Day.js';
import { Task } from './Task.js';

export type DayList = {
	days: Day[];

	unfinished: Task[];
};
