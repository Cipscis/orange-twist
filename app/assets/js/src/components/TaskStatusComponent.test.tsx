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
	act,
	cleanup,
	render,
	screen,
} from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { configMocks, mockAnimationsApi } from 'jsdom-testing-mocks';

import {
	addCommandListener,
	registerCommand,
	removeCommandListener,
} from 'registers/commands';
import { Command } from 'types/Command';

import { TaskStatus } from 'types/TaskStatus';
import { clear, getDayInfo, getDayTaskInfo, getTaskInfo, setDayTaskInfo, setTaskInfo } from 'data';
import { escapeRegExpString } from 'util/index';

import { TaskStatusComponent } from './TaskStatusComponent';

configMocks({
	afterEach,
	afterAll,
});
mockAnimationsApi();

describe('TaskStatusComponent', () => {
	beforeAll(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	});

	beforeEach(() => {
		clear();
		setTaskInfo(1, { status: TaskStatus.COMPLETED });
		setDayTaskInfo({
			dayName: '2023-11-20',
			taskId: 1,
		}, { status: TaskStatus.TODO });
		setDayTaskInfo({
			dayName: '2023-11-24',
			taskId: 1,
		}, { status: TaskStatus.IN_PROGRESS });
		setDayTaskInfo({
			dayName: '2023-11-26',
			taskId: 1,
		}, { status: TaskStatus.COMPLETED });
	});

	afterEach(() => {
		cleanup();
	});

	test('renders nothing if passed an invalid task ID', () => {
		const { container } = render(<TaskStatusComponent
			taskId={-1}
		/>);

		expect(container).toBeEmptyDOMElement();
	});

	test('can\'t be edited in readonly mode', () => {
		const { queryByRole } = render(<TaskStatusComponent
			taskId={1}
			readonly
		/>);

		expect(queryByRole('button')).not.toBeInTheDocument();
	});

	describe('when not passed a day name', () => {
		test('renders its task\'s status', async () => {
			const { getByTitle } = render(<TaskStatusComponent
				taskId={1}
			/>);

			expect(getByTitle(
				new RegExp(escapeRegExpString(TaskStatus.COMPLETED))
			)).toBeInTheDocument();

			await act(() => {
				setTaskInfo(1, { status: TaskStatus.WILL_NOT_DO });
			});
			expect(getByTitle(
				new RegExp(escapeRegExpString(TaskStatus.WILL_NOT_DO))
			)).toBeInTheDocument();
		});

		test('edits a task\'s status directly', async () => {
			const user = userEvent.setup();
			const saveSpy = jest.fn();
			addCommandListener(Command.DATA_SAVE, saveSpy);

			const { getByRole } = render(<TaskStatusComponent
				taskId={1}
			/>);

			const editButton = getByRole('button', {
				name: `${TaskStatus.COMPLETED} (click to edit)`,
			});
			expect(editButton).toBeInTheDocument();

			await user.click(editButton);

			const inProgressStatusButton = getByRole('button', {
				name: TaskStatus.IN_PROGRESS,
			});
			expect(inProgressStatusButton).toBeInTheDocument();

			await user.click(inProgressStatusButton);
			expect(saveSpy).toHaveBeenCalledTimes(1);
			expect(getByRole('button', {
				name: `${TaskStatus.IN_PROGRESS} (click to edit)`,
			})).toBeInTheDocument();
			expect(getTaskInfo(1)?.status).toBe(TaskStatus.IN_PROGRESS);

			removeCommandListener(Command.DATA_SAVE, saveSpy);
		});

		test('can remove a task entirely', async () => {
			const user = userEvent.setup();
			const saveSpy = jest.fn();
			addCommandListener(Command.DATA_SAVE, saveSpy);

			const { getByRole } = render(<TaskStatusComponent
				taskId={1}
			/>);

			const editButton = getByRole('button', {
				name: `${TaskStatus.COMPLETED} (click to edit)`,
			});
			expect(editButton).toBeInTheDocument();

			await user.click(editButton);

			const deleteButton = getByRole('button', {
				name: 'Delete',
			});
			expect(deleteButton).toBeInTheDocument();

			await user.click(deleteButton);
			await user.click(screen.getByRole('button', { name: 'Confirm' }));

			expect(getTaskInfo(1)).toBeNull();

			removeCommandListener(Command.DATA_SAVE, saveSpy);
		});
	});

	describe('when passed a day name', () => {
		test('renders its task\'s status on the specified day', () => {
			const { getByTitle, rerender } = render(<TaskStatusComponent
				taskId={1}
				dayName="2023-11-20"
			/>);

			expect(getByTitle(
				new RegExp(escapeRegExpString(TaskStatus.TODO))
			)).toBeInTheDocument();

			rerender(<TaskStatusComponent
				taskId={1}
				dayName="2023-11-25"
			/>);
			expect(getByTitle(
				new RegExp(escapeRegExpString(TaskStatus.IN_PROGRESS))
			)).toBeInTheDocument();

			rerender(<TaskStatusComponent
				taskId={1}
				dayName="2023-11-27"
			/>);
			expect(getByTitle(
				new RegExp(escapeRegExpString(TaskStatus.COMPLETED))
			)).toBeInTheDocument();
		});

		test('renders nothing if given a day before the task existed', () => {
			const { container } = render(<TaskStatusComponent
				taskId={1}
				dayName="2023-01-01"
			/>);

			expect(container).toBeEmptyDOMElement();
		});

		test('updates if the task\'s status for that day is updated', async () => {
			const { getByRole } = render(<TaskStatusComponent
				taskId={1}
				dayName="2023-11-23"
			/>);

			expect(getByRole('button', {
				name: `${TaskStatus.TODO} (click to edit)`,
			})).toBeInTheDocument();

			await act(() => {
				setDayTaskInfo({
					taskId: 1,
					dayName: '2023-11-21',
				}, { status: TaskStatus.IN_PROGRESS });
			});

			expect(getByRole('button', {
				name: `${TaskStatus.IN_PROGRESS} (click to edit)`,
			})).toBeInTheDocument();
		});

		test('edits a task\'s status for that day only', async () => {
			const user = userEvent.setup();
			const saveSpy = jest.fn();
			addCommandListener(Command.DATA_SAVE, saveSpy);

			const { getByRole } = render(<TaskStatusComponent
				taskId={1}
				dayName="2023-11-24"
			/>);

			const editButton = getByRole('button', {
				name: `${TaskStatus.IN_PROGRESS} (click to edit)`,
			});
			expect(editButton).toBeInTheDocument();

			await user.click(editButton);

			const inReviewStatusButton = getByRole('button', {
				name: TaskStatus.IN_REVIEW,
			});
			expect(inReviewStatusButton).toBeInTheDocument();

			await user.click(inReviewStatusButton);
			expect(saveSpy).toHaveBeenCalledTimes(1);
			expect(getByRole('button', {
				name: `${TaskStatus.IN_REVIEW} (click to edit)`,
			})).toBeInTheDocument();

			// Task status should be unchanged
			expect(getTaskInfo(1)?.status).toBe(TaskStatus.COMPLETED);
			// Day task status should be changed
			expect(
				getDayTaskInfo({ taskId: 1, dayName: '2023-11-24' })?.status
			).toBe(TaskStatus.IN_REVIEW);

			removeCommandListener(Command.DATA_SAVE, saveSpy);
		});

		test('can remove a task from that day', async () => {
			const originalConfirm = window.confirm;
			window.confirm = () => true;

			const user = userEvent.setup();
			const saveSpy = jest.fn();
			addCommandListener(Command.DATA_SAVE, saveSpy);

			const { getByRole } = render(<TaskStatusComponent
				taskId={1}
				dayName="2023-11-26"
			/>);

			const editButton = getByRole('button', {
				name: `${TaskStatus.COMPLETED} (click to edit)`,
			});
			expect(editButton).toBeInTheDocument();

			await user.click(editButton);

			const deleteButton = getByRole('button', {
				name: 'Delete',
			});
			expect(deleteButton).toBeInTheDocument();

			await user.click(deleteButton);
			await user.click(screen.getByRole('button', { name: 'Confirm' }));

			expect(getTaskInfo(1)).not.toBeNull();
			expect(
				getDayTaskInfo({ taskId: 1, dayName: '2023-11-26' })
			).toBeNull();
			expect(getDayInfo('2023-11-26')?.tasks.includes(1)).toBe(false);

			removeCommandListener(Command.DATA_SAVE, saveSpy);
			window.confirm = originalConfirm;
		});
	});
});
