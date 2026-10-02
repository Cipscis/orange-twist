import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	cleanup,
	render,
	waitFor,
} from '@testing-library/preact';

import { insertTestData } from 'database';

import { DayTaskListLegacy } from './DayTaskListLegacy';

describe('DayTaskListLegacy', () => {
	beforeEach(() => insertTestData({
		task: {
			1: {
				id: 1,
				name: 'Task one',
				note: '',
				sortIndex: 1,
			},
			2: {
				id: 2,
				name: 'Task two',
				note: '',
				sortIndex: 3,
			},
			3: {
				id: 3,
				name: 'Task three',
				note: '',
				sortIndex: 2,
			},
			4: {
				id: 4,
				name: 'Task four',
				note: '',
				sortIndex: -1,
			},
		},
	}));

	afterEach(() => {
		cleanup();
	});

	test('renders a specified array of tasks in order', async () => {
		const { queryAllByText } = render(<DayTaskListLegacy
			taskIds={[3, 2, 1]}
			dayName="2026-09-16"
		/>);

		await waitFor(() => {
			const tasks = queryAllByText(/^Task /);
			expect(tasks.map(({ textContent }) => textContent)).toEqual([
				'Task three',
				'Task two',
				'Task one',
			]);
		});
	});
});
