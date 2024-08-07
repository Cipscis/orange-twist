import { h } from 'preact';

import {
	afterAll,
	afterEach,
	beforeAll,
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
import { configMocks, mockAnimationsApi } from 'jsdom-testing-mocks';

import { randomUUID } from 'node:crypto';

import { ls } from 'persist';

import { addCommandListener, fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import {
	clear,
	getAllDayTaskInfo,
	getAllTaskInfo,
	getDayInfo,
} from 'data';
import { KeyboardShortcutName, addKeyboardShortcutListener } from 'registers/keyboard-shortcuts';

import { OrangeTwist } from './OrangeTwist';

configMocks({
	afterEach,
	afterAll,
});
mockAnimationsApi();

describe('OrangeTwist', () => {
	beforeAll(() => {
		// jsdom doesn't implement `window.crypto.randomUUID`, so use the Node version
		// https://github.com/jsdom/jsdom/issues/1612
		window.crypto.randomUUID = randomUUID;
	});

	afterEach(() => {
		cleanup();
		localStorage.clear();
		clear();
	});

	test('renders its children', async () => {
		const { getByTestId } = render(
			<OrangeTwist persist={ls}>
				<div data-testid="orange-twist-child-1" />
				<div data-testid="orange-twist-child-2" />
			</OrangeTwist>
		);

		await waitFor(() => {
			expect(getByTestId('orange-twist-child-1')).toBeInTheDocument();
			expect(getByTestId('orange-twist-child-2')).toBeInTheDocument();
		});
	});

	test('sets up the toggle theme command', () => {
		render(<OrangeTwist persist={ls} />);

		fireCommand(Command.THEME_TOGGLE);
		expect(
			getComputedStyle(document.documentElement).getPropertyValue('--theme')
		).toBe('light');

		fireCommand(Command.THEME_TOGGLE);
		expect(
			getComputedStyle(document.documentElement).getPropertyValue('--theme')
		).toBe('dark');
	});

	test('sets up the keyboard shortcut to open the command palette', async () => {
		const user = userEvent.setup();

		const { getByTestId } = render(<OrangeTwist persist={ls} />);

		await user.keyboard('\\');

		expect(getByTestId('command-palette__field')).toBeInTheDocument();
	});

	test('sets up the keyboard shortcuts to finish editing', async () => {
		const user = userEvent.setup();

		const controller = new AbortController();
		const { signal } = controller;

		const spy = jest.fn();

		render(<OrangeTwist persist={ls} />);

		addKeyboardShortcutListener(KeyboardShortcutName.EDITING_FINISH, spy, { signal });

		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledTimes(1);
		await user.keyboard('{Control>}{Enter}{/Control}');
		expect(spy).toHaveBeenCalledTimes(2);

		controller.abort();
	});

	test('sets up the command and keyboard shortcut to save data', async () => {
		const user = userEvent.setup();

		render(<OrangeTwist persist={ls} />);

		const spy = jest.fn();
		addCommandListener(Command.DATA_SAVE, spy);

		await user.keyboard('{Control>}s{/Control}');
		expect(spy).toHaveBeenCalledTimes(1);

		removeEventListener(Command.DATA_SAVE, spy);
	});

	test('sets up the command to add a new day', () => {
		render(<OrangeTwist persist={ls} />);

		fireCommand(Command.DAY_ADD_NEW, '2023-11-26');

		expect(getDayInfo('2023-11-26')).toEqual({
			name: '2023-11-26',
			note: '',
			tasks: [],
		});
	});

	test('sets up the command to create a new task', async () => {
		const user = userEvent.setup();
		render(<OrangeTwist persist={ls} />);

		await act(() => fireCommand(Command.TASK_ADD_NEW, '2023-11-26'));
		await user.keyboard('Test event{Enter}');

		expect(getAllDayTaskInfo({ dayName: '2023-11-26' }).length).toBe(1);
		expect(getAllTaskInfo()?.[0]?.name).toBe('Test event');
	});

	test('renders a back button if passed a "backButton" prop', () => {
		const { queryByRole, rerender } = render(<OrangeTwist persist={ls} />);
		expect(queryByRole('link', { name: 'Back' })).not.toBeInTheDocument();

		rerender(<OrangeTwist persist={ls} backButton />);
		expect(queryByRole('link', { name: 'Back' })).toBeInTheDocument();
	});
});
