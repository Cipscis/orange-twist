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

import { UnfinishedTaskList } from './UnfinishedTaskList';

describe('UnfinishedTaskList', () => {
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

	test('renders all unfinished tasks', () => {
		const { queryByText } = render(<UnfinishedTaskList />);

		expect(queryByText('Task one')).toBeInTheDocument();
		expect(queryByText('Task four')).toBeInTheDocument();

		expect(queryByText('Task two')).not.toBeInTheDocument();
		expect(queryByText('Task three')).not.toBeInTheDocument();
	});

	test.todo('updates tasks\' sortIndices and saves when reordering');
});
