import { h } from 'preact';

import {
	afterEach,
	beforeAll,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { randomUUID } from 'node:crypto';

import { addCommandListener, fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { getAllDayTaskInfo, getDayInfo } from 'data';

import { OrangeTwist } from './OrangeTwist';
import { KeyboardShortcutName, addKeyboardShortcutListener } from 'registers/keyboard-shortcuts';

describe('OrangeTwist', () => {
	beforeAll(() => {
		// jsdom doesn't implement `window.crypto.randomUUID`, so use the Node version
		// https://github.com/jsdom/jsdom/issues/1612
		window.crypto.randomUUID = randomUUID;
	});

	afterEach(() => {
		cleanup();
		localStorage.clear();
	});

	test('renders its children', () => {
		const { getByTestId } = render(
			<OrangeTwist>
				<div data-testid="orange-twist-child-1" />
				<div data-testid="orange-twist-child-2" />
			</OrangeTwist>
		);

		expect(getByTestId('orange-twist-child-1')).toBeInTheDocument();
		expect(getByTestId('orange-twist-child-2')).toBeInTheDocument();
	});

	test('sets up the toggle theme command', () => {
		render(<OrangeTwist />);

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

		const { getByTestId } = render(<OrangeTwist />);

		await user.keyboard('\\');

		expect(getByTestId('command-palette')).toBeInTheDocument();
	});

	test('sets up the keyboard shortcuts to finish editing', async () => {
		const user = userEvent.setup();

		const controller = new AbortController();
		const { signal } = controller;

		const spy = jest.fn();

		render(<OrangeTwist />);

		addKeyboardShortcutListener(KeyboardShortcutName.EDITING_FINISH, spy, { signal });

		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledTimes(1);
		await user.keyboard('{Control>}{Enter}{/Control}');
		expect(spy).toHaveBeenCalledTimes(2);

		controller.abort();
	});

	test('sets up the command and keyboard shortcut to save data', async () => {
		const user = userEvent.setup();

		render(<OrangeTwist />);

		const spy = jest.fn();
		addCommandListener(Command.DATA_SAVE, spy);

		await user.keyboard('{Control>}s{/Control}');
		expect(spy).toHaveBeenCalledTimes(1);

		removeEventListener(Command.DATA_SAVE, spy);
	});

	test('sets up the command to add a new day', () => {
		render(<OrangeTwist />);

		fireCommand(Command.DAY_ADD_NEW, '2023-11-26');

		expect(getDayInfo('2023-11-26')).toEqual({
			name: '2023-11-26',
			note: '',
			tasks: [],
		});
	});

	test('sets up the command to create a new task', () => {
		render(<OrangeTwist />);

		fireCommand(Command.TASK_ADD_NEW, '2023-11-26');

		expect(getAllDayTaskInfo({ dayName: '2023-11-26' }).length).toBe(1);
	});
});
