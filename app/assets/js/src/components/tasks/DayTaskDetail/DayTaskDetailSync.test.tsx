import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	act,
	cleanup,
	render,
	waitFor,
} from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { DayTaskDetailSync } from './DayTaskDetailSync';

describe('DayTaskDetailSync', () => {
	afterEach(() => cleanup());

	test('renders the day task\'s note', () => {
		jest.useFakeTimers();
		const { getByText } = render(<DayTaskDetailSync
			dayTask={{
				id: 1,
				day: 1,
				task: 1,
				status: 1,
				summary: null,
				note: 'Day task note',
				sortIndex: null,
			}}
			setDayTask={async () => {}}
		/>);

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		const status = getByText('Day task note');
		expect(status).toBeInTheDocument();
	});

	test('renders the day task\'s status', async () => {
		const { getByRole } = render(<DayTaskDetailSync
			dayTask={{
				id: 1,
				day: 1,
				task: 1,
				status: 1,
				summary: null,
				note: '',
				sortIndex: null,
			}}
			setDayTask={async () => {}}
		/>);

		await waitFor(() => {
			const statusEl = getByRole('button', { name: 'Todo (click to edit)' });
			expect(statusEl).toBeInTheDocument();
		});
	});

	test('renders the day task\'s summary and edit summary button', () => {
		const {
			getByRole,
			getByText,
		} = render(<DayTaskDetailSync
			dayTask={{
				id: 1,
				day: 1,
				task: 1,
				status: 1,
				summary: 'Test summary',
				note: '',
				sortIndex: null,
			}}
			setDayTask={async () => {}}
		/>);

		const summaryText = getByText('Test summary');
		expect(summaryText).toBeInTheDocument();

		const summaryEditButton = getByRole('button', { name: 'Edit summary' });
		expect(summaryEditButton).toBeInTheDocument();
	});

	test('updates the day task\'s note when it\'s changed', async () => {
		const user = userEvent.setup();
		const spy = jest.fn(async (data) => {});

		jest.useFakeTimers();
		const { getByRole } = render(<DayTaskDetailSync
			dayTask={{
				id: 1,
				day: 1,
				task: 1,
				status: 1,
				summary: null,
				note: 'Day task note',
				sortIndex: null,
			}}
			setDayTask={spy}
		/>);

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		const noteEditButton = getByRole('button', { name: 'Edit note' });
		await user.click(noteEditButton);
		await user.keyboard(' edited');
		await user.click(document.body);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith({ note: 'Day task note edited' });
	});

	test('renders an open or closed details based on the "open" prop', () => {
		const {
			getByRole,
			rerender,
		} = render(<DayTaskDetailSync
			dayTask={{
				id: 1,
				day: 1,
				task: 1,
				status: 1,
				summary: null,
				note: 'Day task note',
				sortIndex: null,
			}}
			setDayTask={async () => {}}
		/>);

		const details = getByRole('group') as HTMLDetailsElement;
		expect(details).toBeInTheDocument();
		expect(details.open).toBe(false);

		rerender(<DayTaskDetailSync
			dayTask={{
				id: 1,
				day: 1,
				task: 1,
				status: 1,
				summary: null,
				note: 'Day task note',
				sortIndex: null,
			}}
			setDayTask={async () => {}}
			open
		/>);

		expect(details.open).toBe(true);
	});
});
