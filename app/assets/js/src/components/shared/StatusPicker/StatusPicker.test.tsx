import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import '@testing-library/jest-dom/jest-globals';
import userEvent from '@testing-library/user-event';
import { cleanup, render } from '@testing-library/preact';

import { StatusPicker } from './StatusPicker';

describe('StatusPicker', () => {
	afterEach(() => {
		cleanup();
	});

	test('renders nothing if passed an invalid status', () => {
		const { container } = render(<StatusPicker
			// @ts-expect-error Testing an invalid status
			status="invalid-status"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		expect(container).toBeEmptyDOMElement();
	});

	test('renders the status it\'s provided', () => {
		const { getByRole, rerender } = render(<StatusPicker
			status="ready-to-test"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		expect(getByRole('button', { name: 'Ready to test (click to edit)' })).toBeInTheDocument();

		rerender(<StatusPicker
			status="completed"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		expect(getByRole('button', { name: 'Completed (click to edit)' })).toBeInTheDocument();
	});

	test('enters edit mode on click', async () => {
		const user = userEvent.setup();

		const { getByRole, queryByRole } = render(<StatusPicker
			status="todo"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		const editButton = getByRole('button', { name: 'Todo (click to edit)' });

		expect(queryByRole('dialog')).not.toBeInTheDocument();

		await user.click(editButton);

		expect(queryByRole('dialog')).toBeInTheDocument();
	});

	test('calls onStatusSelect with selected status', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { getByRole } = render(<StatusPicker
			status="todo"
			onStatusSelect={spy}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		const editButton = getByRole('button', { name: 'Todo (click to edit)' });
		await user.click(editButton);

		const statusButton = getByRole('button', { name: 'Completed' });
		expect(spy).not.toHaveBeenCalled();
		await user.click(statusButton);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith('completed');
	});

	test('exits edit mode on status select', async () => {
		const user = userEvent.setup();

		const { getByRole, queryByRole } = render(<StatusPicker
			status="todo"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		const editButton = getByRole('button', { name: 'Todo (click to edit)' });
		await user.click(editButton);

		expect(queryByRole('dialog')).toBeInTheDocument();

		const statusButton = getByRole('button', { name: 'Completed' });
		await user.click(statusButton);

		expect(queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('calls onDelete when clicking delete button', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { getByRole } = render(<StatusPicker
			status="todo"
			onStatusSelect={jest.fn()}
			onDelete={spy}
			deleteButtonTitle="Delete"
		/>);

		const editButton = getByRole('button', { name: 'Todo (click to edit)' });
		await user.click(editButton);

		const deleteButton = getByRole('button', { name: 'Delete' });
		expect(spy).not.toHaveBeenCalled();
		await user.click(deleteButton);

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('exits edit mode on delete button click', async () => {
		const user = userEvent.setup();

		const { getByRole, queryByRole } = render(<StatusPicker
			status="todo"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		const editButton = getByRole('button', { name: 'Todo (click to edit)' });
		await user.click(editButton);

		expect(queryByRole('dialog')).toBeInTheDocument();

		const deleteButton = getByRole('button', { name: 'Delete' });
		await user.click(deleteButton);

		expect(queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('renders correct delete button title', async () => {
		const user = userEvent.setup();

		const { getByRole } = render(<StatusPicker
			status="todo"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Custom title"
		/>);

		const editButton = getByRole('button', { name: 'Todo (click to edit)' });
		await user.click(editButton);

		const deleteButton = getByRole('button', { name: 'Custom title' });
		expect(deleteButton).toBeInTheDocument();
	});

	test('exits edit mode on light dismiss', async () => {
		const user = userEvent.setup();

		const { getByRole, queryByRole } = render(<StatusPicker
			status="todo"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		const editButton = getByRole('button', { name: 'Todo (click to edit)' });
		await user.click(editButton);

		const dialog = getByRole('dialog');
		expect(dialog).toBeInTheDocument();

		await user.click(dialog);

		expect(queryByRole('dialog')).not.toBeInTheDocument();
	});

	test('exits edit mode on escape keypress', async () => {
		const user = userEvent.setup();

		const { getByRole, queryByRole } = render(<StatusPicker
			status="todo"
			onStatusSelect={jest.fn()}
			onDelete={jest.fn()}
			deleteButtonTitle="Delete"
		/>);

		const editButton = getByRole('button', { name: 'Todo (click to edit)' });
		await user.click(editButton);

		const dialog = getByRole('dialog');
		expect(dialog).toBeInTheDocument();

		await user.keyboard('{Escape}');

		expect(queryByRole('dialog')).not.toBeInTheDocument();
	});
});
