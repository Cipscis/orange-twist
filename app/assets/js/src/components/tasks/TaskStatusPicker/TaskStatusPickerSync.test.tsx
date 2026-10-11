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

import { cleanup, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { insertTestData } from 'database';

import { TaskStatusPickerSync } from './TaskStatusPickerSync';

describe('TaskStatusPickerSync', () => {
	beforeEach(() => insertTestData());

	afterEach(() => cleanup());

	test('renders its task\'s status', async () => {
		const { findByTitle } = render(<TaskStatusPickerSync
			status={3}
			setStatus={async () => {}}
			deleteTask={async () => {}}
		/>);

		expect(await findByTitle('Completed (click to edit)')).toBeInTheDocument();
	});

	test('edits a task\'s status directly', async () => {
		const user = userEvent.setup();
		const saveSpy = jest.fn(async (status: number) => {});

		const { findByRole } = render(<TaskStatusPickerSync
			status={2}
			setStatus={saveSpy}
			deleteTask={async () => {}}
		/>);

		const editButton = await findByRole('button', {
			name: `In progress (click to edit)`,
		});
		expect(editButton).toBeInTheDocument();

		await user.click(editButton);

		const completedStatusButton = await findByRole('button', {
			name: 'Completed',
		});
		expect(completedStatusButton).toBeInTheDocument();

		await user.click(completedStatusButton);
		expect(saveSpy).toHaveBeenCalledTimes(1);
		expect(saveSpy).toHaveBeenCalledWith(3);

	});

	test('can remove a task entirely', async () => {
		const user = userEvent.setup();
		const saveSpy = jest.fn(async () => {});

		const { findByRole } = render(<TaskStatusPickerSync
			status={2}
			setStatus={async () => {}}
			deleteTask={saveSpy}
		/>);

		const editButton = await findByRole('button', {
			name: `In progress (click to edit)`,
		});
		expect(editButton).toBeInTheDocument();

		await user.click(editButton);

		const deleteButton = await findByRole('button', {
			name: 'Delete task',
		});
		expect(deleteButton).toBeInTheDocument();

		await user.click(deleteButton);
		expect(saveSpy).toHaveBeenCalledTimes(1);
	});
});
