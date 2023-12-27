import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

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

		const content = getByTestId('task-component-name');
		expect(content).toBeInTheDocument();
		expect(content.innerHTML.trim()).toBe('<p><strong>Bold</strong> <em>italic</em> <code>code</code></p>');
	});

	test('renders the task status', () => {
		setTaskInfo(0, { status: TaskStatus.IN_PROGRESS });

		const { getByTitle } = render(<Task taskId={0} />);

		expect(getByTitle(/In progress/)).toBeInTheDocument();
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
		expect(getByTitle(/In progress/)).toBeInTheDocument();

		await act(() => {
			setDayTaskInfo(
				{ taskId: 1, dayName: '2023-11-24' },
				{ status: TaskStatus.IN_REVIEW }
			);
		});
		expect(getByTitle(/In review/)).toBeInTheDocument();

		await act(() => {
			setDayTaskInfo(
				{ taskId: 1, dayName: '2023-11-25' },
				{ status: TaskStatus.COMPLETED }
			);
		});
		expect(getByTitle(/Completed/)).toBeInTheDocument();
	});

	test('opens edit mode when edit button is clicked', async () => {
		const user = userEvent.setup();

		setTaskInfo(0, {
			name: 'Task name',
			status: TaskStatus.TODO,
		});

		const { getByRole } = render(
			<Task taskId={0} />
		);

		const editButton = getByRole('button', { name: 'Edit task name' });
		await user.click(editButton);

		const inputEl = getByRole('textbox');
		expect(inputEl).toHaveFocus();
		expect(inputEl).toHaveValue('Task name');
	});

	test('opens edit mode when name is clicked', async () => {
		const user = userEvent.setup();

		setTaskInfo(0, {
			name: 'Task name',
			status: TaskStatus.TODO,
		});

		const { getByRole, getByText } = render(
			<Task taskId={0} />
		);

		const name = getByText('Task name');
		await user.click(name);

		const inputEl = getByRole('textbox');
		expect(inputEl).toHaveFocus();
		expect(inputEl).toHaveValue('Task name');
	});

	test('doesn\'t open edit mode when a link inside is clicked', async () => {
		const user = userEvent.setup();

		setTaskInfo(0, {
			name: '[Link text](#)',
			status: TaskStatus.TODO,
		});

		const { getByRole, queryByRole } = render(
			<Task taskId={0} />
		);

		const name = getByRole('link', { name: 'Link text' });
		await user.click(name);

		const inputEl = queryByRole('textbox');
		expect(inputEl).not.toBeInTheDocument();
	});
});
