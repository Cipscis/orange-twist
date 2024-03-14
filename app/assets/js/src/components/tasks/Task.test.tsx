import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';

import { TaskStatus } from 'types/TaskStatus';
import {
	clear,
	setDayTaskInfo,
	setTaskInfo,
} from 'data';

import { Task } from './Task';
import { act } from 'preact/test-utils';

describe('Task', () => {
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
			<Task taskId={0} />
		);

		const content = getByTestId('inline-note__note');
		expect(content).toBeInTheDocument();
		expect(content.innerHTML.trim()).toBe('<strong>Bold</strong> <em>italic</em> <code>code</code>');
	});

	test('renders the task status', () => {
		setTaskInfo(0, { status: TaskStatus.IN_PROGRESS });

		const { getByTitle } = render(<Task taskId={0} />);

		expect(getByTitle('In progress (click to edit)')).toBeInTheDocument();
	});

	test('renders the task status for the specified day', async () => {
		setTaskInfo(1, { status: TaskStatus.TODO });
		setDayTaskInfo(
			{ taskId: 1, dayName: '2023-11-23' },
			{ status: TaskStatus.IN_PROGRESS }
		);

		const { getByTitle } = render(<Task
			taskId={1}
			dayName="2023-11-25"
		/>);
		expect(getByTitle('In progress (click to edit)')).toBeInTheDocument();

		await act(() => {
			setDayTaskInfo(
				{ taskId: 1, dayName: '2023-11-24' },
				{ status: TaskStatus.IN_REVIEW }
			);
		});
		expect(getByTitle('In review (click to edit)')).toBeInTheDocument();

		await act(() => {
			setDayTaskInfo(
				{ taskId: 1, dayName: '2023-11-25' },
				{ status: TaskStatus.COMPLETED }
			);
		});
		expect(getByTitle('Completed (click to edit)')).toBeInTheDocument();
	});
});
