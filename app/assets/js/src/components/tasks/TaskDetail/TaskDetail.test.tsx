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

import { insertTestData } from 'database';
import { OrangeTwistContext } from 'components/OrangeTwistContext';

import { TaskDetail } from './TaskDetail';

describe('TaskDetail', () => {
	beforeEach(() => insertTestData());

	afterEach(() => {
		cleanup();
	});

	test('renders the task\'s note', async () => {
		const { findByText } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskDetail taskId={1} />
		</OrangeTwistContext.Provider>);

		expect(await findByText('Test task 1 note')).toBeInTheDocument();
	});

	test('renders the status and day name for day tasks', async () => {
		const {
			getByText,
			getByTitle,
		} = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskDetail taskId={1} />
		</OrangeTwistContext.Provider>);

		const dayNameEl = getByText('2026-04-26');
		expect(dayNameEl).toBeInTheDocument();

		await waitFor(() => {
			const status = getByTitle('In progress (click to edit)');
			expect(status).toBeInTheDocument();
		});
	});
});
