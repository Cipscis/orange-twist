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
} from '@testing-library/preact';

import userEvent from '@testing-library/user-event';

import { TaskStatus } from 'types/TaskStatus';
import {
	clear,
	setTaskInfo,
} from 'data';

import { TaskLookup } from './TaskLookup';

describe('TaskLookup', () => {
	beforeEach(() => {
		clear();

		setTaskInfo(1, {
			name: 'Task one',
			status: TaskStatus.IN_PROGRESS,
			sortIndex: 1,
		});
		setTaskInfo(2, {
			name: 'Task two',
			status: TaskStatus.COMPLETED,
			sortIndex: 3,
		});
		setTaskInfo(3, {
			name: 'Task three',
			status: TaskStatus.WILL_NOT_DO,
			sortIndex: 2,
		});
		setTaskInfo(4, {
			name: 'Task four',
			status: TaskStatus.INVESTIGATING,
			sortIndex: -1,
		});
		setTaskInfo(5, {
			name: 'Task five',
			status: TaskStatus.COMPLETED,
			sortIndex: -1,
		});
		setTaskInfo(6, {
			name: 'Task six',
			status: TaskStatus.COMPLETED,
			note: 'No day task info',
		});
	});

	afterEach(() => {
		cleanup();
	});

	test('renders all tasks', () => {
		const spy = jest.fn();
		const { queryByText } = render(<TaskLookup onSelect={spy} />);

		expect(queryByText('Task one')).toBeInTheDocument();
		expect(queryByText('Task two')).toBeInTheDocument();
		expect(queryByText('Task three')).toBeInTheDocument();
		expect(queryByText('Task four')).toBeInTheDocument();
		expect(queryByText('Task five')).toBeInTheDocument();
		expect(queryByText('Task six')).toBeInTheDocument();
	});

	test('calls onSelect callback when a task is selected', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		const { getByRole } = render(<TaskLookup onSelect={spy} />);

		const select = getByRole('combobox');

		await user.selectOptions(select, String(1));
		expect(spy).toHaveBeenCalledWith(1);
	});

	test('allows tasks to be filtered', () => {
		const spy = jest.fn();
		const { queryByText } = render(<TaskLookup
			onSelect={spy}
			filter={(task) => task.status === TaskStatus.COMPLETED}
		/>);

		expect(queryByText('Task one')).not.toBeInTheDocument();
		expect(queryByText('Task two')).toBeInTheDocument();
		expect(queryByText('Task three')).not.toBeInTheDocument();
		expect(queryByText('Task four')).not.toBeInTheDocument();
		expect(queryByText('Task five')).toBeInTheDocument();
		expect(queryByText('Task six')).toBeInTheDocument();
	});
});
