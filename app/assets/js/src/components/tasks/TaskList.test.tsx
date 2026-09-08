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

import { TaskList } from './TaskList';

describe('TaskList', () => {
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
			status: TaskStatus.INVESTIGATING,
			sortIndex: 2,
		});
		setTaskInfo(4, {
			name: 'Task four',
			status: TaskStatus.COMPLETED,
			sortIndex: -1,
		});
	});

	afterEach(() => {
		cleanup();
	});

	test('renders a specified array of tasks in order', () => {
		const { queryAllByText } = render(<TaskList
			taskIds={[3, 2, 1]}
		/>);

		const tasks = queryAllByText(/^Task /);
		expect(tasks.map(({ textContent }) => textContent)).toEqual([
			'Task three',
			'Task two',
			'Task one',
		]);
	});
});
