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
			matcher={[3, 2, 1]}
		/>);

		const tasks = queryAllByText(/^Task /);
		expect(tasks.map(({ textContent }) => textContent)).toEqual([
			'Task three',
			'Task two',
			'Task one',
		]);
	});

	test('renders all tasks matching a matcher function', () => {
		const { queryByText } = render(<TaskList
			matcher={(task) => task.status === TaskStatus.COMPLETED}
		/>);

		expect(queryByText('Task two')).toBeInTheDocument();
		expect(queryByText('Task four')).toBeInTheDocument();

		expect(queryByText('Task one')).not.toBeInTheDocument();
		expect(queryByText('Task three')).not.toBeInTheDocument();
	});

	test('when using a matching function, sorts tasks by sortIndex', () => {
		const { queryAllByText } = render(<TaskList
			matcher={() => true}
		/>);

		const tasks = queryAllByText(/^Task /);
		expect(tasks.map(({ textContent }) => textContent)).toEqual([
			'Task four',
			'Task one',
			'Task three',
			'Task two',
		]);
	});
});
