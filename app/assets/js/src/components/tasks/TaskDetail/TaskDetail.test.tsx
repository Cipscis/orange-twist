import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	cleanup,
	render,
	waitFor,
} from '@testing-library/preact';
import '@testing-library/jest-dom/jest-globals';

import { TaskStatus } from 'types/TaskStatus';
import {
	clear,
	createTask,
	setDayTaskInfo,
} from 'data';
import { insertTestData } from 'database';
import { OrangeTwistContext } from 'components/OrangeTwistContext';

import { TaskDetail } from './TaskDetail';

describe('TaskDetail', () => {
	beforeEach(async () => {
		clear();
		await insertTestData();
	});

	afterEach(() => {
		cleanup();
	});

	test('renders the task\'s note', async () => {
		const taskId = createTask({
			note: 'Task note',
		});

		const { findByText } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskDetail taskId={taskId} />
		</OrangeTwistContext.Provider>);

		expect(await findByText('Test task 1 note')).toBeInTheDocument();
	});

	test('renders the status and day name for day tasks', async () => {
		const taskId = createTask();
		const dayName = '2024-01-14';

		setDayTaskInfo({
			taskId,
			dayName,
		}, {
			status: TaskStatus.IN_PROGRESS,
		});

		const {
			getByText,
			getByTitle,
		} = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskDetail taskId={taskId} />
		</OrangeTwistContext.Provider>);

		const dayNameEl = getByText(dayName);
		expect(dayNameEl).toBeInTheDocument();

		await waitFor(() => {
			const status = getByTitle('In progress (click to edit)');
			expect(status).toBeInTheDocument();
		});
	});
});
