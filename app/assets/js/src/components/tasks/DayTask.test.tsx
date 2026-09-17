import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	cleanup,
	render,
	waitFor,
} from '@testing-library/preact';
import { insertTestData } from 'database';

import { DayTask } from './DayTask';

describe('DayTask', () => {
	beforeEach(() => insertTestData({
		day: {
			1: {
				id: 1,
				year: 2023,
				month: 11,
				day: 23,
				note: '',
			},
		},
		task: {
			1: {
				id: 1,
				name: '**Bold** *italic* `code`',
				note: '',
				sortIndex: 1,
			},
		},
		day_task: {
			1: {
				id: 1,
				day: 1,
				task: 1,
				status: 2,
				note: '',
				summary: null,
				sortIndex: 1,
			},
		},
	}));

	afterEach(() => cleanup());

	test('renders the task name as Markdown', () => {
		const { getByTestId } = render(
			<DayTask
				taskId={1}
				dayName="2023-11-23"
			/>
		);

		const content = getByTestId('inline-note__note');
		expect(content).toBeInTheDocument();
		expect(content.innerHTML.trim()).toBe('<strong>Bold</strong> <em>italic</em> <code>code</code>');
	});

	test('renders the task status for the specified day', async () => {
		const { getByTitle } = render(<DayTask
			taskId={1}
			dayName="2023-11-23"
		/>);
		await waitFor(() => {
			expect(getByTitle('In progress (click to edit)')).toBeInTheDocument();
		});
	});
});
