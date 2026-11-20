import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	cleanup,
	render,
	waitFor,
} from '@testing-library/preact';

import userEvent from '@testing-library/user-event';

import { insertTestData } from 'database';

import { TaskLookup } from './TaskLookup';

describe('TaskLookup', () => {
	beforeEach(async () => {
		await insertTestData({
			task: {
				1: {
					id: 1,
					name: 'Task one',
					note: 'Note one',
					sortIndex: null,
				},
				2: {
					id: 2,
					name: 'Task two',
					note: 'Note two',
					sortIndex: null,
				},
				3: {
					id: 3,
					name: 'Task three',
					note: '',
					sortIndex: null,
				},
			},
		});
	});

	afterEach(() => {
		cleanup();
	});

	test('renders all tasks', async () => {
		const spy = jest.fn();
		const { findByText } = render(<TaskLookup onSelect={spy} />);

		expect(await findByText('Task one')).toBeInTheDocument();
		expect(await findByText('Task two')).toBeInTheDocument();
		expect(await findByText('Task three')).toBeInTheDocument();
	});

	test('calls onSelect callback when a task is selected', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		const { findByText, getByRole } = render(<TaskLookup onSelect={spy} />);

		// Wait for loading
		await findByText('Task one');

		const select = getByRole('combobox');

		await user.selectOptions(select, String(1));
		expect(spy).toHaveBeenCalledWith(1);
	});

	test('allows tasks to be filtered', async () => {
		const spy = jest.fn();
		const { queryByText } = render(<TaskLookup
			onSelect={spy}
			filter={(task) => task.note !== ''}
		/>);

		await waitFor(() => {
			expect(queryByText('Task one')).toBeInTheDocument();
			expect(queryByText('Task two')).toBeInTheDocument();
			expect(queryByText('Task three')).not.toBeInTheDocument();
		});
	});
});
