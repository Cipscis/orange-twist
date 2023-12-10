import { h } from 'preact';

import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { render } from '@testing-library/preact';
import '@testing-library/jest-dom/jest-globals';

import { clear, createTask } from 'data';

import { TaskDetail } from './TaskDetail';

describe('TaskDetail', () => {
	beforeEach(() => {
		clear();
	});

	test('renders the task\'s note', () => {
		const taskId = createTask({
			note: 'Task note',
		});

		const { getByText } = render(<TaskDetail taskId={taskId} />);

		expect(getByText('Task note')).toBeInTheDocument();
	});
});
