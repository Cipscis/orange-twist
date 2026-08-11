import { h } from 'preact';

import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { Command } from 'types/Command';
import { addCommandListener, registerCommand } from 'registers/commands';

import { clear } from 'data';

import { createTestData, SaveType } from 'database';

import { OrangeTwistContext } from 'components/OrangeTwistContext';
import { OrangeTwist } from 'components/OrangeTwist';

import { TaskNote } from './TaskNote';

describe('TaskNote', () => {
	beforeAll(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	});

	beforeEach(async () => {
		clear();
		await createTestData();
	});

	afterEach(() => {
		cleanup();
	});

	test('renders the task\'s note', async () => {
		const { findByText } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskNote taskId={1} />
		</OrangeTwistContext.Provider>);

		expect(await findByText('Test task 1 note')).toBeInTheDocument();
	});

	test('saves note after change', async () => {
		const controller = new AbortController();
		const { signal } = controller;

		const user = userEvent.setup();

		const spy = jest.fn();

		addCommandListener(Command.DATA_SAVE, spy, { signal });

		const { findAllByRole } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskNote taskId={1} />
		</OrangeTwistContext.Provider>);

		const noteEditButton = (await findAllByRole('button', { name: 'Edit note' }))[0];
		await user.click(noteEditButton);
		await user.keyboard(' edited');

		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith([{
			type: SaveType.TASK,
			id: 1,
			task: { note: 'Test task 1 note edited' },
		}]);

		controller.abort();
	});

	test('reloads note data after change', async () => {

		const user = userEvent.setup();

		const {
			findAllByRole,
			findByText,
		} = render(
			// Render the full <OrangeTwist> wrapper so it implements saving
			<OrangeTwist>
				<TaskNote taskId={1} />
			</OrangeTwist>
		);

		expect(await findByText('Test task 1 note')).toBeInTheDocument();

		const noteEditButton = (await findAllByRole('button', { name: 'Edit note' }))[0];
		await user.click(noteEditButton);
		await user.keyboard(' edited');

		await user.click(document.body);

		expect(await findByText('Test task 1 note edited')).toBeInTheDocument();
	});
});
