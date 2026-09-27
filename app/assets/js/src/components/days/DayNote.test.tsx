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

import { DayNote } from './DayNote';

describe('DayNote', () => {
	beforeAll(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	});

	beforeEach(() => {
		clear();
	});

	afterEach(() => {
		cleanup();
	});

	test('renders the day\'s note', () => {
		const { getByText } = render(<DayNote
			day={{
				id: 1,
				note: 'Day note',
			}}
		/>);

		expect(getByText('Day note')).toBeInTheDocument();
	});

	test('saves note after change', async () => {
		const controller = new AbortController();
		const { signal } = controller;

		const user = userEvent.setup();

		const spy = jest.fn();

		addCommandListener(Command.DATA_SAVE, spy, { signal });

		const { getByRole } = render(<DayNote
			day={{
				id: 1,
				note: 'Day note',
			}}
		/>);

		const noteEditButton = getByRole('button', { name: 'Edit note' });
		await user.click(noteEditButton);
		await user.keyboard(' edited');

		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith([{
			type: SaveType.DAY,
			id: 1,
			day: { note: 'Day note edited' },
		}]);

		controller.abort();
	});
});
