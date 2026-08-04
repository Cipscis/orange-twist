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
		const { getByText } = render(<OrangeTwistContext.Provider
			value={{
				isLoading: false,
			}}
		>
			<DayNote
				day={{
					name: '2026-08-04',
					note: 'Day note',
					tasks: [],
				}}
			/>
		</OrangeTwistContext.Provider>);

		expect(getByText('Day note')).toBeInTheDocument();
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
			<DayNote
				day={{
					name: '2026-08-04',
					note: 'Day note',
					tasks: [],
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
			type: SaveType.DAY_LEGACY,
			dayName: '2026-08-04',
			day: { note: 'Day note edited' },
		}]);

		controller.abort();
	});
});
