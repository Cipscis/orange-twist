import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { cleanup, render } from '@testing-library/preact';
import '@testing-library/jest-dom/jest-globals';

import { TaskStatus } from 'types/TaskStatus';
import { clear, createTask, setDayTaskInfo } from 'data';
import { OrangeTwistContext } from 'components/OrangeTwistContext';

import { TaskDetail } from './TaskDetail';

describe('TaskDetail', () => {
	beforeEach(() => {
		clear();
	});

	afterEach(() => {
		cleanup();
	});

	test('renders the task\'s note', () => {
		const taskId = createTask({
			note: 'Task note',
		});

		const { getByText } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskDetail taskId={taskId} />
		</OrangeTwistContext.Provider>);

		expect(getByText('Task note')).toBeInTheDocument();
	});

	test('renders the status and day name for day tasks', () => {
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

		const status = getByTitle('In progress (click to edit)');
		expect(status).toBeInTheDocument();
	});
});
