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
import { SaveType } from 'database';

import { OrangeTwistContext } from 'components/OrangeTwistContext';

import { DayTaskNote } from './DayTaskNote';

describe('DayTaskNote', () => {
	beforeAll(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	});

	beforeEach(() => {
		clear();
	});

	afterEach(() => {
		cleanup();
	});

	test('renders the day task\'s note', () => {
		const { getByText } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<DayTaskNote
				dayTask={{
					dayName: '2026-08-04',
					taskId: 1,
					summary: 'Summary',
					note: 'Day task note',
					status: 'todo',
				}}
			/>
		</OrangeTwistContext.Provider>);

		expect(getByText('Day task note')).toBeInTheDocument();
	});

	test('saves note after change', async () => {
		const controller = new AbortController();
		const { signal } = controller;

		const user = userEvent.setup();

		const spy = jest.fn();

		addCommandListener(Command.DATA_SAVE, spy, { signal });

		const { getAllByRole } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<DayTaskNote
				dayTask={{
					dayName: '2026-08-04',
					taskId: 1,
					summary: 'Summary',
					note: 'Day task note',
					status: 'todo',
				}}
			/>
		</OrangeTwistContext.Provider>);

		const noteEditButton = getAllByRole('button', { name: 'Edit note' })[0];
		await user.click(noteEditButton);
		await user.keyboard(' edited');

		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith([{
			type: SaveType.DAY_TASK_LEGACY,
			dayName: '2026-08-04',
			taskId: 1,
			dayTask: { note: 'Day task note edited' },
		}]);

		controller.abort();
	});
});
