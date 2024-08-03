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

import {
	act,
	cleanup,
	render,
} from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { Command } from 'types/Command';
import { addCommandListener, registerCommand } from 'registers/commands';

import { KeyboardShortcutName, registerKeyboardShortcut } from 'registers/keyboard-shortcuts';

import { TaskStatus } from 'types/TaskStatus';
import {
	clear,
	getDayTaskInfo,
	setDayTaskInfo,
} from 'data';

import { DayTaskDetail } from './DayTaskDetail';

describe('DayTaskDetail', () => {
	beforeAll(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	});

	beforeEach(() => {
		setDayTaskInfo({
			dayName: '2023-12-22',
			taskId: 1,
		}, {
			status: TaskStatus.IN_PROGRESS,
			note: 'Task note',
			summary: 'Test summary',
		});
	});

	afterEach(() => {
		clear();
		cleanup();
	});

	test('renders the day task\'s note', () => {
		const dayTaskInfo = getDayTaskInfo({ dayName: '2023-12-22', taskId: 1 })!;

		jest.useFakeTimers();
		const { getByText } = render(<DayTaskDetail
			dayTaskInfo={dayTaskInfo}
		/>);

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		const status = getByText('Task note');
		expect(status).toBeInTheDocument();
	});

	test('renders the day task\'s status', () => {
		const dayTaskInfo = getDayTaskInfo({ dayName: '2023-12-22', taskId: 1 })!;

		const { getByRole } = render(<DayTaskDetail
			dayTaskInfo={dayTaskInfo}
		/>);

		const statusEl = getByRole('button', { name: 'In progress (click to edit)' });
		expect(statusEl).toBeInTheDocument();
	});

	test('renders the day task\'s summary and edit summary button', () => {
		const dayTaskInfo = getDayTaskInfo({ dayName: '2023-12-22', taskId: 1 })!;

		const {
			getByRole,
			getByText,
		} = render(<DayTaskDetail
			dayTaskInfo={dayTaskInfo}
		/>);

		const summaryText = getByText('Test summary');
		expect(summaryText).toBeInTheDocument();

		const summaryEditButton = getByRole('button', { name: 'Edit summary' });
		expect(summaryEditButton).toBeInTheDocument();
	});

	test('updates the day task\'s note when it\'s changed', async () => {
		const user = userEvent.setup();
		const dayTaskInfo = getDayTaskInfo({ dayName: '2023-12-22', taskId: 1 })!;

		jest.useFakeTimers();
		const { getByRole } = render(<DayTaskDetail
			dayTaskInfo={dayTaskInfo}
		/>);

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		const noteEditButton = getByRole('button', { name: 'Edit note' });
		await user.click(noteEditButton);
		await user.keyboard(' edited');
		await user.click(document.body);

		expect(getDayTaskInfo({ dayName: '2023-12-22', taskId: 1 })?.note).toBe('Task note edited');
	});

	test('saves changes when finished editing', async () => {
		const controller = new AbortController();
		const { signal } = controller;

		const user = userEvent.setup();
		const spy = jest.fn();

		addCommandListener(Command.DATA_SAVE, spy, { signal });
		registerKeyboardShortcut(
			KeyboardShortcutName.EDITING_FINISH,
			[
				{ key: 'Enter', ctrl: true },
				{ key: 'Escape' },
			]
		);

		const dayTaskInfo = getDayTaskInfo({ dayName: '2023-12-22', taskId: 1 })!;

		jest.useFakeTimers();
		const { getByRole } = render(<DayTaskDetail
			dayTaskInfo={dayTaskInfo}
		/>);

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		const noteEditButton = getByRole('button', { name: 'Edit note' });
		expect(noteEditButton).toBeInTheDocument();

		await user.click(noteEditButton);

		await user.keyboard(' edited');

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('{Control>}{Enter}{/Control}');

		expect(spy).toHaveBeenCalledTimes(1);

		controller.abort();
	});

	test('renders an open or closed details based on the "open" prop', () => {
		const dayTaskInfo = getDayTaskInfo({ dayName: '2023-12-22', taskId: 1 })!;

		const {
			getByRole,
			rerender,
		} = render(<DayTaskDetail
			dayTaskInfo={dayTaskInfo}
		/>);

		const details = getByRole('group') as HTMLDetailsElement;
		expect(details).toBeInTheDocument();
		expect(details.open).toBe(false);

		rerender(<DayTaskDetail
			dayTaskInfo={dayTaskInfo}
			open
		/>);

		expect(details.open).toBe(true);
	});
});
