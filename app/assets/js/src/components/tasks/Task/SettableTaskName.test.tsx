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

import { SettableTaskName } from './SettableTaskName';
import userEvent from '@testing-library/user-event';

describe('SettableTaskName', () => {
	beforeEach(() => insertTestData({
		task: {
			1: {
				id: 1,
				name: '**Bold** _italic_ `code`',
				note: '',
				sortIndex: 1,
			},
		},
	}));

	afterEach(() => cleanup());

	test('shows a loader until the task is loaded', async () => {
		const { getByTestId } = render(
			<SettableTaskName taskId={1} />
		);

		const loader = getByTestId('loader');
		expect(loader).toBeInTheDocument();

		await waitFor(() => {
			expect(loader).not.toBeInTheDocument();
		});
	});

	test.todo('displays an error if the task could not be loaded');

	test('renders the task name as Markdown', async () => {
		const { findByTestId } = render(
			<SettableTaskName taskId={1} />
		);

		const content = await findByTestId('inline-note__note');
		expect(content).toBeInTheDocument();
		expect(content.innerHTML.trim()).toBe(
			'<strong>Bold</strong> <em>italic</em> <code>code</code>'
		);
	});

	test('allows the task name to be edited', async () => {
		const user = userEvent.setup();

		const { findByRole, getByTestId } = render(
			<SettableTaskName taskId={1} />
		);

		const editButton = await findByRole('button', { name: 'Edit task name' });

		await user.click(editButton);

		const input = await findByRole('textbox');

		await user.type(input, 'New task name');
		await user.keyboard('{Enter}');

		const name = getByTestId('inline-note__note');
		// Using `user.type` starts with the caret after the existing text
		expect(name.innerHTML.trim()).toBe(
			'<strong>Bold</strong> <em>italic</em> <code>code</code>New task name'
		);
	});

	test.todo('if the task name is deleted, delete the task');
});
