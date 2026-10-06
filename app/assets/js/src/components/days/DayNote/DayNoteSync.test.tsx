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

import { clear } from 'data';

import { SaveType } from 'database';

import { DayNoteSync } from './DayNoteSync';

describe('DayNoteSync', () => {
	beforeEach(() => {
		clear();
	});

	afterEach(() => {
		cleanup();
	});

	test('renders the day\'s note', () => {
		const { getByText } = render(<DayNoteSync
			day={{
				id: 1,
				note: 'Day note',
			}}
			setDay={async () => {}}
		/>);

		expect(getByText('Day note')).toBeInTheDocument();
	});

	test('saves note after change', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();

		const { getByRole } = render(<DayNoteSync
			day={{
				id: 1,
				note: 'Day note',
			}}
			setDay={(...args) => {
				spy(...args);
				return Promise.resolve();
			}}
		/>);

		const noteEditButton = getByRole('button', { name: 'Edit note' });
		await user.click(noteEditButton);
		await user.keyboard(' edited');

		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith({ note: 'Day note edited' });
	});
});
