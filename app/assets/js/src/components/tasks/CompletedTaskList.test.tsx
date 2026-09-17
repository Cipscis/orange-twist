import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	act,
	cleanup,
	render,
} from '@testing-library/preact';

import { insertTestData } from 'database';

import { CompletedTaskList } from './CompletedTaskList';

describe('CompletedTaskList', () => {
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
			5: {
				id: 5,
				name: 'Task five',
				note: '',
				sortIndex: -1,
			},
		},
		day: {
			1: {
				id: 1,
				year: 2024,
				month: 3,
				day: 1,
				note: '',
			},
			2: {
				id: 2,
				year: 2024,
				month: 3,
				day: 2,
				note: '',
			},
			3: {
				id: 3,
				year: 2024,
				month: 3,
				day: 3,
				note: '',
			},
			4: {
				id: 4,
				year: 2024,
				month: 3,
				day: 4,
				note: '',
			},
		},
		day_task: {
			1: {
				id: 1,
				day: 4,
				task: 1,
				status: 2,
				note: '',
				summary: null,
				sortIndex: 1,
			},
			2: {
				id: 2,
				day: 3,
				task: 2,
				status: 3,
				note: '',
				summary: null,
				sortIndex: 1,
			},
			3: {
				id: 3,
				day: 2,
				task: 3,
				status: 9,
				note: '',
				summary: null,
				sortIndex: 1,
			},
			4: {
				id: 4,
				day: 1,
				task: 4,
				status: 4,
				note: '',
				summary: null,
				sortIndex: 1,
			},
			5: {
				id: 5,
				day: 2,
				task: 5,
				status: 3,
				note: '',
				summary: null,
				sortIndex: 1,
			},
		},
	}));

	afterEach(() => {
		cleanup();
	});

	test('renders all completed tasks', () => {
		jest.useFakeTimers();
		const { queryByText } = render(<CompletedTaskList open />);

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		expect(queryByText('Task two')).toBeInTheDocument();
		expect(queryByText('Task three')).toBeInTheDocument();
		expect(queryByText('Task five')).toBeInTheDocument();

		expect(queryByText('Task one')).not.toBeInTheDocument();
		expect(queryByText('Task four')).not.toBeInTheDocument();
	});

	test('renders completed tasks in reverse order of completion', () => {
		jest.useFakeTimers();
		const { queryAllByText } = render(<CompletedTaskList open />);

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		const tasks = queryAllByText(/^Task /);
		expect(tasks.map(({ textContent }) => textContent)).toEqual([
			'Task two',
			'Task five',
			'Task three',
		]);
	});
});
