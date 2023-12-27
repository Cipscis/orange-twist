import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';

import { TaskStatus } from 'types/TaskStatus';
import { clear, setTaskInfo } from 'data';

import { CompletedTaskList } from './CompletedTaskList';

describe('CompletedTaskList', () => {
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
	});

	afterEach(() => {
		cleanup();
	});

	test('renders all completed tasks', () => {
		const { queryByText } = render(<CompletedTaskList />);

		expect(queryByText('Task two')).toBeInTheDocument();
		expect(queryByText('Task three')).toBeInTheDocument();

		expect(queryByText('Task one')).not.toBeInTheDocument();
		expect(queryByText('Task four')).not.toBeInTheDocument();
	});
});
