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
} from '@testing-library/preact';

import { insertTestData } from 'database';

import { Task } from './Task';

describe('Task', () => {
	beforeEach(() => insertTestData({
		day: {
			1: {
				id: 1,
				year: 2023,
				month: 11,
				day: 23,
				note: '',
			},
			2: {
				id: 2,
				year: 2023,
				month: 11,
				day: 24,
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
			2: {
				id: 2,
				name: 'Task two',
				note: '',
				sortIndex: 2,
			},
		},
		day_task: {
			1: {
				id: 1,
				day: 1,
				task: 2,
				status: 2,
				note: '',
				summary: null,
				sortIndex: 1,
			},
			2: {
				id: 2,
				day: 1,
				task: 1,
				status: 2,
				note: '',
				summary: null,
				sortIndex: 1,
			},
			3: {
				id: 3,
				day: 2,
				task: 1,
				status: 5,
				note: '',
				summary: null,
				sortIndex: 1,
			},
		},
	}));

	afterEach(() => cleanup());

	test('renders the task name as Markdown', async () => {
		const { findByTestId } = render(
			<Task taskId={1} />
		);

		const content = await findByTestId('inline-note__note');
		expect(content).toBeInTheDocument();
		expect(content.innerHTML.trim()).toBe('<strong>Bold</strong> <em>italic</em> <code>code</code>');
	});

	test('renders the task status', async () => {
		const { findByTitle } = render(<Task taskId={1} />);

		expect(
			await findByTitle('In review (click to edit)')
		).toBeInTheDocument();
	});
});
