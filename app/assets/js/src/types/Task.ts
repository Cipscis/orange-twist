import { Equivalent, Expect, PredicateType, isAllOf, isAnyOf, isArrayOf, isObjectWithPropertyOfType, isTypeof, isValueOf } from '@cipscis/ts-toolbox';
import { TaskStatus, isTaskStatus } from './TaskStatus.js';

export type Task = {
	id: number;
	name: string;
	status: TaskStatus;

	parent: number | null;
	children: Array<number>;
};

export const isTask = isAllOf(
	isObjectWithPropertyOfType(
		'id', isTypeof('number')
	),
	isObjectWithPropertyOfType(
		'name', isTypeof('string')
	),
	isObjectWithPropertyOfType(
		'status', isTaskStatus
	),

	isObjectWithPropertyOfType(
		'parent',
		isAnyOf(
			isTypeof('number'),
			isValueOf(null)
		)
	),
	isObjectWithPropertyOfType(
		'children',
		isArrayOf(isTypeof('number'))
	)
);

// This type is just used to ensure the typeguard is in sync with the type
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
type Test = Expect<Equivalent<Task, PredicateType<typeof isTask>>>;
