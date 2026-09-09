import type { DatabaseData } from '../types';
import { ObjectStoreName } from '../metadata';

/**
 * **Important!** For use within tests only.
 *
 * Construct an Orange Twist database v2 containing test data.
 */
export function createTestData(): DatabaseData {
	return {
		[ObjectStoreName.DAY]: [
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note 1',
			},
			{
				id: 2,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 2',
			},
			{
				id: 3,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 3',
			},
		],
		[ObjectStoreName.TASK]: [
			{
				id: 1,
				name: 'Test task 1',
				note: 'Test task 1 note',
				sortIndex: 1,
			},
			{
				id: 2,
				name: 'Test task 2',
				note: 'Test task 2 note',
				sortIndex: 2,
			},
			{
				id: 3,
				name: 'Test task 3',
				note: 'Test task 3 note',
				sortIndex: 0,
			},
		],
		[ObjectStoreName.DAY_TASK]: [
			{
				id: 1,
				day: 1,
				task: 1,
				note: 'Note for task 1 day 1',
				summary: 'Summary for task 1 day 1',
				status: 2,
				sortIndex: 1,
			},
			{
				id: 2,
				day: 1,
				task: 2,
				note: 'Note for task 2 day 1',
				summary: 'Summary for task 2 day 1',
				status: 2,
				sortIndex: 0,
			},
		],
		[ObjectStoreName.STATUS]: [
			{
				id: 1,
				alias: 'todo',
				name: 'Todo',
				icon: 'todo.svg',
				colour: 'var(--blue)',
				completed: false,
			},
			{
				id: 2,
				alias: 'in-progress',
				name: 'In progress',
				icon: 'in-progress.svg',
				colour: 'var(--blue)',
				completed: false,
			},
			{
				id: 3,
				alias: 'completed',
				name: 'Completed',
				icon: 'completed.svg',
				colour: 'var(--green)',
				completed: true,
			},
		],
		[ObjectStoreName.TEMPLATE]: [
			{
				id: 1,
				name: 'Template 1 name',
				template: 'Template 1',
				sortIndex: 1,
			},
			{
				id: 2,
				name: 'Template 2 name',
				template: 'Template 2',
				sortIndex: 0,
			},
		],
		[ObjectStoreName.IMAGE]: {
			'test-hash': {
				hash: 'test-hash',
				// Working with image Blobs causes problems working with the FileReader, so just use some data that can be read from the Blob directly
				file: new Blob(['test data'], { type: 'text/plain' }),
			},
		},
	};
}
