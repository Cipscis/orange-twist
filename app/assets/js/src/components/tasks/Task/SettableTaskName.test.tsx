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

	test('displays an error if the task could not be loaded', async () => {
		const { findByTestId } = render(
			<SettableTaskName taskId={-1} />
		);

		const errorNotice = await findByTestId('settable-task-name__error-notice');
		expect(errorNotice).toBeInTheDocument();
		expect(errorNotice.textContent).toBe('Failed to load task with ID -1');
	});

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

	test('if the task name is deleted, prompts the user to confirm deleting the task', async () => {
		const user = userEvent.setup();

		const { findByRole, findByTestId } = render(
			<SettableTaskName taskId={1} />
		);

		const editButton = await findByRole('button', { name: 'Edit task name' });

		await user.click(editButton);
		let input = await findByRole('textbox');
		await user.click(input);
		await user.clear(input);
		await user.keyboard('{Enter}');

		const cancelButton = await findByRole('button', { name: 'Cancel' });
		await user.click(cancelButton);

		expect(cancelButton).not.toBeInTheDocument();
		const name = await findByTestId('inline-note__note');
		expect(name.innerHTML.trim()).toBe(
			'<strong>Bold</strong> <em>italic</em> <code>code</code>'
		);

		await user.click(editButton);
		input = await findByRole('textbox');
		await user.click(input);
		await user.clear(input);
		await user.keyboard('{Enter}');

		const confirmButton = await findByRole('button', { name: 'Confirm' });
		await user.click(confirmButton);

		const errorNotice = await findByTestId('settable-task-name__error-notice');
		expect(errorNotice).toBeInTheDocument();
		expect(errorNotice.textContent).toBe('Failed to load task with ID 1');
	});
});
