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

import { SaveType } from 'types/SaveAction';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import { TaskNote } from './TaskNote';

describe('TaskNote', () => {
	beforeAll(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	});

	beforeEach(() => {
		clear();
	});

	afterEach(() => {
		cleanup();
	});

	test('renders the task\'s note', () => {
		const { getByText } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskNote
				task={{
					id: 1,
					name: 'Test task',
					note: 'Task note',
					status: 'todo',
					sortIndex: 1,
				}}
			/>
		</OrangeTwistContext.Provider>);

		expect(getByText('Task note')).toBeInTheDocument();
	});

	test('saves note after change', async () => {
		const controller = new AbortController();
		const { signal } = controller;

		const user = userEvent.setup();

		const spy = jest.fn();

		addCommandListener(Command.DATA_SAVE, spy, { signal });

		const { getByRole } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<TaskNote
				task={{
					id: 1,
					name: 'Test task',
					note: 'Task note',
					status: 'todo',
					sortIndex: 1,
				}}
			/>
		</OrangeTwistContext.Provider>);

		const noteEditButton = getByRole('button', { name: 'Edit note' });
		await user.click(noteEditButton);
		await user.keyboard(' edited');

		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith([{
			type: SaveType.TASK_NOTE,
			task: 1,
			note: 'Task note edited',
		}]);

		controller.abort();
	});
});
