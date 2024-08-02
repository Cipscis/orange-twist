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

import { TaskStatus } from 'types/TaskStatus';
import {
	clear,
	setDayTaskInfo,
	setTaskInfo,
} from 'data';

import { CompletedTaskList } from './CompletedTaskList';

describe('CompletedTaskList', () => {
	beforeEach(() => {
		clear();

		setTaskInfo(1, {
			name: 'Task one',
			status: TaskStatus.IN_PROGRESS,
			sortIndex: 1,
		});
		setDayTaskInfo({
			taskId: 1,
			dayName: '2024-03-04',
		}, {
			status: TaskStatus.IN_PROGRESS,
		});

		setTaskInfo(2, {
			name: 'Task two',
			status: TaskStatus.COMPLETED,
			sortIndex: 3,
		});
		setDayTaskInfo({
			taskId: 2,
			dayName: '2024-03-03',
		}, {
			status: TaskStatus.COMPLETED,
		});

		setTaskInfo(3, {
			name: 'Task three',
			status: TaskStatus.WILL_NOT_DO,
			sortIndex: 2,
		});
		setDayTaskInfo({
			taskId: 3,
			dayName: '2024-03-02',
		}, {
			status: TaskStatus.WILL_NOT_DO,
		});

		setTaskInfo(4, {
			name: 'Task four',
			status: TaskStatus.INVESTIGATING,
			sortIndex: -1,
		});
		setDayTaskInfo({
			taskId: 4,
			dayName: '2024-03-01',
		}, {
			status: TaskStatus.INVESTIGATING,
		});

		setTaskInfo(5, {
			name: 'Task five',
			status: TaskStatus.COMPLETED,
			sortIndex: -1,
		});
		setDayTaskInfo({
			taskId: 5,
			dayName: '2024-03-02',
		}, {
			status: TaskStatus.COMPLETED,
		});

		setTaskInfo(6, {
			name: 'Task six',
			status: TaskStatus.COMPLETED,
			note: 'No day task info',
		}, { forCurrentDay: false });
	});

	afterEach(() => {
		cleanup();
	});

	test('renders all completed tasks', () => {
		jest.useFakeTimers();
		const { queryByText } = render(<CompletedTaskList />);

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
		const { queryAllByText } = render(<CompletedTaskList />);

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		const tasks = queryAllByText(/^Task /);
		expect(tasks.map(({ textContent }) => textContent)).toEqual([
			'Task two',
			'Task five',
			'Task three',
			'Task six',
		]);
	});
});
