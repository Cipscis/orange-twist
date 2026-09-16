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
	cleanup,
	render,
	waitFor,
} from '@testing-library/preact';
import { act } from 'preact/test-utils';

import { TaskStatus } from 'types/TaskStatus';
import {
	clear,
	setDayTaskInfo,
	setTaskInfo,
} from 'data';
import { insertTestData } from 'database';

import { DayTask } from './DayTask';

describe('DayTask', () => {
	beforeEach(() => insertTestData());

	afterEach(() => {
		cleanup();
		clear();
	});

	test('renders the task name as Markdown', () => {
		setTaskInfo(0, {
			name: '**Bold** *italic* `code`',
			status: TaskStatus.TODO,
		});

		const { getByTestId } = render(
			<DayTask taskId={0} dayName="2026-09-16" />
		);

		const content = getByTestId('inline-note__note');
		expect(content).toBeInTheDocument();
		expect(content.innerHTML.trim()).toBe('<strong>Bold</strong> <em>italic</em> <code>code</code>');
	});

	test('renders the task status for the specified day', async () => {
		setTaskInfo(1, { status: TaskStatus.TODO });
		setDayTaskInfo(
			{ taskId: 1, dayName: '2023-11-23' },
			{ status: TaskStatus.IN_PROGRESS }
		);

		const { getByTitle } = render(<DayTask
			taskId={1}
			dayName="2023-11-25"
		/>);
		await waitFor(() => {
			expect(getByTitle('In progress (click to edit)')).toBeInTheDocument();
		});

		await act(() => {
			jest.useFakeTimers();
			setDayTaskInfo(
				{ taskId: 1, dayName: '2023-11-24' },
				{ status: TaskStatus.IN_REVIEW }
			);
			jest.advanceTimersByTime(1500);
			jest.useRealTimers();
		});
		await waitFor(() => {
			expect(getByTitle('In review (click to edit)')).toBeInTheDocument();
		});

		await act(() => {
			jest.useFakeTimers();
			setDayTaskInfo(
				{ taskId: 1, dayName: '2023-11-25' },
				{ status: TaskStatus.COMPLETED }
			);
			jest.advanceTimersByTime(1500);
			jest.useRealTimers();
		});
		await waitFor(() => {
			expect(getByTitle('Completed (click to edit)')).toBeInTheDocument();
		});
	});
});
