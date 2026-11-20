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

import { insertTestData } from 'database';

import { TaskDetail } from './TaskDetail';

describe('TaskDetail', () => {
	beforeEach(() => insertTestData());

	afterEach(() => {
		cleanup();
	});

	test('renders the task\'s note', async () => {
		const { findByText } = render(<TaskDetail taskId={1} />);

		expect(await findByText('Test task 1 note')).toBeInTheDocument();
	});

	test('renders the status and day name for day tasks', async () => {
		const {
			findByText,
			findByTitle,
		} = render(<TaskDetail taskId={1} />);

		const dayNameEl = await findByText('2026-04-26');
		expect(dayNameEl).toBeInTheDocument();

		const status = await findByTitle('In progress (click to edit)');
		expect(status).toBeInTheDocument();
	});
});
