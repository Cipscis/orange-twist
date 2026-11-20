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

import { SettableDayTaskNoteSync } from './SettableDayTaskNoteSync';

describe('SettableDayTaskNoteSync', () => {
	beforeEach(() => insertTestData());

	afterEach(() => {
		cleanup();
	});

	test('renders the day task\'s note', async () => {
		const { findByText } = render(<SettableDayTaskNoteSync
			dayTask={{
				id: 1,
				note: 'Day task note',
			}}
			setDayTask={async () => {}}
		/>);

		expect(await findByText('Day task note')).toBeInTheDocument();
	});

	test('saves note after change', async () => {
		const user = userEvent.setup();

		const spy = jest.fn(async (data) => {});

		const { getAllByRole } = render(<SettableDayTaskNoteSync
			dayTask={{
				id: 1,
				note: 'Day task note',
			}}
			setDayTask={spy}
		/>);

		const noteEditButton = getAllByRole('button', { name: 'Edit note' })[0];
		await user.click(noteEditButton);
		await user.keyboard(' edited');

		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith({ note: 'Day task note edited' });
	});
});
