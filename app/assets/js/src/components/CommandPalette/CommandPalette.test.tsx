import { h } from 'preact';

import { afterEach, describe, expect, jest, test } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { act, cleanup, render } from '@testing-library/preact';

import { CommandPalette } from './CommandPalette';
import userEvent from '@testing-library/user-event';
import { Command, addCommandListener, registerCommand, unregisterAllCommands } from 'registers/commands';
import { KeyboardShortcutName, bindKeyboardShortcutToCommand, registerKeyboardShortcut } from 'registers/keyboard-shortcuts';

describe('CommandPalette', () => {
	afterEach(() => {
		cleanup();
		unregisterAllCommands();
	});

	test('is only rendered when open is true', () => {
		const { rerender, queryByTestId } = render(
			<CommandPalette
				open={false}
				onClose={() => {}}
			/>
		);

		expect(queryByTestId('command-palette')).not.toBeInTheDocument();

		rerender(<CommandPalette
			open
			onClose={() => {}}
		/>);

		expect(queryByTestId('command-palette')).toBeInTheDocument();
	});

	test('calls onClose when closed internally', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		render(
			<CommandPalette
				open
				onClose={spy}
			/>
		);

		expect(spy).not.toHaveBeenCalled();

		await act(() => user.keyboard('{Escape}'));

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('renders a text field', () => {
		const { getByRole } = render(
			<CommandPalette
				open
				onClose={() => {}}
			/>
		);

		expect(getByRole('textbox')).toBeInTheDocument();
	});

	test('renders buttons for all registered commands', () => {
		registerCommand({
			id: Command.DATA_SAVE,
			name: 'Test name',
		});

		registerCommand({
			id: Command.DAY_ADD_NEW,
			name: 'Second command',
		});

		const { getByRole } = render(
			<CommandPalette
				open
				onClose={() => {}}
			/>
		);

		const commandButton = getByRole('button', { name: 'Test name' });
		expect(commandButton).toBeInTheDocument();

		const commandButton2 = getByRole('button', { name: 'Second command' });
		expect(commandButton2).toBeInTheDocument();
	});

	test('fires a command and closes when clicking a command button', async () => {
		const user = userEvent.setup();
		const closeSpy = jest.fn();
		const fireCommandSpy = jest.fn();

		registerCommand({
			id: Command.DATA_SAVE,
			name: 'Test name',
		});

		addCommandListener(Command.DATA_SAVE, fireCommandSpy);

		const { getByRole } = render(
			<CommandPalette
				open
				onClose={closeSpy}
			/>
		);

		const commandButton = getByRole('button', { name: 'Test name' });
		expect(commandButton).toBeInTheDocument();

		expect(fireCommandSpy).not.toHaveBeenCalled();

		await user.click(commandButton);

		expect(fireCommandSpy).toHaveBeenCalled();
		expect(closeSpy).toHaveBeenCalled();
	});

	test('displays a keyboard shortcut if one is bound to a command', () => {
		registerCommand({
			id: Command.DATA_SAVE,
			name: 'Test name',
		});
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 's', ctrl: true }]);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);

		const { getByRole } = render(
			<CommandPalette
				open
				onClose={() => {}}
			/>
		);

		const commandButton = getByRole('button', { name: 'Test name Ctrl + s' });
		expect(commandButton).toBeInTheDocument();
	});

	test('moves keyboard focus into a query input when opened', () => {
		const { getByRole } = render(
			<CommandPalette
				open
				onClose={() => {}}
			/>
		);

		const queryInput = getByRole('textbox');
		expect(queryInput).toBeInTheDocument();
		expect(queryInput).toHaveFocus();
	});

	test('allows an active descendant to be selected using the up and down arrows, and fired with "Enter"', async () => {
		const user = userEvent.setup();
		const closeSpy = jest.fn();

		registerCommand({
			id: Command.DATA_SAVE,
			name: 'Command 1',
		});
		registerCommand({
			id: Command.DAY_ADD_NEW,
			name: 'Command 2',
		});
		registerCommand({
			id: Command.TASK_ADD_NEW,
			name: 'Command 3',
		});

		const { getByRole } = render(
			<CommandPalette
				open
				onClose={closeSpy}
			/>
		);

		const queryInput = getByRole('textbox');

		expect(queryInput.getAttribute('aria-activedescendant')).toBe(null);
		await user.keyboard('{ArrowDown}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe(Command.DATA_SAVE);
		await user.keyboard('{ArrowDown}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe(Command.DAY_ADD_NEW);
		await user.keyboard('{ArrowDown}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe(Command.TASK_ADD_NEW);
		// It should wrap around
		await user.keyboard('{ArrowDown}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe(Command.DATA_SAVE);
		// And back
		await user.keyboard('{ArrowUp}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe(Command.TASK_ADD_NEW);
		await user.keyboard('{ArrowUp}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe(Command.DAY_ADD_NEW);

		const fireCommandSpy = jest.fn();
		addCommandListener(Command.DAY_ADD_NEW, fireCommandSpy);

		await user.keyboard('{Enter}');

		expect(fireCommandSpy).toHaveBeenCalled();
		expect(closeSpy).toHaveBeenCalled();
	});

	test('allows commands to be filtered', async () => {
		const user = userEvent.setup();
		const closeSpy = jest.fn();

		registerCommand({
			id: Command.DATA_SAVE,
			name: 'abcd',
		});
		registerCommand({
			id: Command.DAY_ADD_NEW,
			name: 'cdef',
		});
		registerCommand({
			id: Command.TASK_ADD_NEW,
			name: 'efgh',
		});

		const {
			getAllByRole,
			getByRole,
			queryByRole,
		} = render(
			<CommandPalette
				open
				onClose={closeSpy}
			/>
		);

		// Displays all
		let commandButtons = getAllByRole('button');
		expect(commandButtons.length).toBe(3);

		// Doesn't fire anything with multiple results and no active descendant
		await user.keyboard('{Enter}');
		expect(closeSpy).not.toHaveBeenCalled();

		// Only two names match this query
		await user.keyboard('ef');

		commandButtons = getAllByRole('button');
		expect(commandButtons.length).toBe(2);
		expect(queryByRole('button', { name: 'abcd' })).not.toBeInTheDocument();

		const queryInput = getByRole('textbox');

		// Skips over hidden items
		await user.keyboard('{ArrowDown}{ArrowDown}');

		expect(queryInput.getAttribute('aria-activedescendant')).toBe(Command.TASK_ADD_NEW);

		const fireCommand3Spy = jest.fn();
		addCommandListener(Command.TASK_ADD_NEW, fireCommand3Spy);

		// Fires selected item
		await user.keyboard('{Enter}');

		expect(fireCommand3Spy).toHaveBeenCalled();
		expect(closeSpy).toHaveBeenCalled();

		// New query matches only onoe
		await user.keyboard('{Backspace}{Backspace}a');

		commandButtons = getAllByRole('button');
		expect(commandButtons.length).toBe(1);
		expect(queryInput.getAttribute('aria-activedescendant')).toBe(null);

		const fireCommand1Spy = jest.fn();
		addCommandListener(Command.DATA_SAVE, fireCommand1Spy);

		// When there's only one result, it fires even without being active descendant
		await user.keyboard('{Enter}');

		expect(fireCommand1Spy).toHaveBeenCalled();
		expect(closeSpy).toHaveBeenCalledTimes(2);
	});
});
