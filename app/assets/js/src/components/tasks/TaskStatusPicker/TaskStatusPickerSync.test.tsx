import { h } from 'preact';

import {
	afterAll,
	afterEach,
	beforeAll,
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
	screen,
	waitFor,
} from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { configMocks, mockAnimationsApi } from 'jsdom-testing-mocks';

import {
	addCommandListener,
	registerCommand,
	removeCommandListener,
} from 'registers/commands';
import { Command } from 'types/Command';

import {
	insertTestData,
	SaveType,
	type SaveAction,
} from 'database';

import { TaskStatusPickerSync } from './TaskStatusPickerSync';

configMocks({
	afterEach,
	afterAll,
});
mockAnimationsApi();

describe('TaskStatusPickerSync', () => {
	beforeAll(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	});

	beforeEach(async () => await insertTestData());

	afterEach(() => cleanup());

	test('renders its task\'s status', async () => {
		const { findByTitle } = render(<TaskStatusPickerSync
			task={{
				id: 1,
				name: 'Test task',
				note: '',
				sortIndex: 1,
			}}
			status={3}
			setStatus={async () => {}}
		/>);

		expect(await findByTitle('Completed (click to edit)')).toBeInTheDocument();
	});

	test('edits a task\'s status directly', async () => {
		const user = userEvent.setup();
		const saveSpy = jest.fn(async (status: number) => {});

		const { findByRole } = render(<TaskStatusPickerSync
			task={{
				id: 1,
				name: 'Test task',
				note: '',
				sortIndex: 1,
			}}
			status={2}
			setStatus={saveSpy}
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
		await waitFor(() => {
			expect(saveSpy).toHaveBeenCalledTimes(1);
			expect(saveSpy).toHaveBeenCalledWith(3);
		});

	});

	test('can remove a task entirely', async () => {
		const user = userEvent.setup();
		const saveSpy = jest.fn();
		addCommandListener(Command.DATA_SAVE, saveSpy);

		const { findByRole } = render(<TaskStatusPickerSync
			task={{
				id: 1,
				name: 'Test task',
				note: '',
				sortIndex: 1,
			}}
			status={2}
			setStatus={async () => {}}
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
		await user.click(screen.getByRole('button', { name: 'Confirm' }));
		await waitFor(() => {
			expect(saveSpy).toHaveBeenCalledTimes(1);
			expect(saveSpy).toHaveBeenCalledWith([{
				type: SaveType.TASK_DELETE,
				id: 1,
			}] satisfies SaveAction[]);
		});

		removeCommandListener(Command.DATA_SAVE, saveSpy);
	});
});
