import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { act, cleanup, render } from '@testing-library/preact';

import { CommandPalette } from './CommandPalette';
import userEvent from '@testing-library/user-event';
import {
	addCommandListener,
	registerCommand,
	unregisterCommand,
} from 'registers/commands';
import {
	KeyboardShortcutName,
	bindKeyboardShortcutToCommand,
	registerKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

describe('CommandPalette', () => {
	afterEach(() => {
		cleanup();
		unregisterCommand('__TEST_COMMAND_A__');
		unregisterCommand('__TEST_COMMAND_B__');
		unregisterCommand('__TEST_COMMAND_C__');
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
		registerCommand('__TEST_COMMAND_A__', { name: 'Test name' });
		registerCommand('__TEST_COMMAND_B__', { name: 'Second command' });

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

		registerCommand('__TEST_COMMAND_A__', { name: 'Test name' });
		addCommandListener('__TEST_COMMAND_A__', fireCommandSpy);

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
		registerCommand('__TEST_COMMAND_A__', { name: 'Test name' });
		registerKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, [{ key: 's', ctrl: true, alt: true, shift: true }]);

		bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, '__TEST_COMMAND_A__');

		const { getByRole } = render(
			<CommandPalette
				open
				onClose={() => {}}
			/>
		);

		const commandButton = getByRole('button', { name: 'Test name Ctrl + Alt + Shift + s' });
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

		registerCommand('__TEST_COMMAND_A__', { name: 'Command 1' });
		registerCommand('__TEST_COMMAND_B__', { name: 'Command 2' });
		registerCommand('__TEST_COMMAND_C__', { name: 'Command 3' });

		const { getByRole } = render(
			<CommandPalette
				open
				onClose={closeSpy}
			/>
		);

		const queryInput = getByRole('textbox');

		expect(queryInput.getAttribute('aria-activedescendant')).toBe(null);
		await user.keyboard('{ArrowDown}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe('__TEST_COMMAND_A__');
		await user.keyboard('{ArrowDown}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe('__TEST_COMMAND_B__');
		await user.keyboard('{ArrowDown}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe('__TEST_COMMAND_C__');
		// It should wrap around
		await user.keyboard('{ArrowDown}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe('__TEST_COMMAND_A__');
		// And back
		await user.keyboard('{ArrowUp}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe('__TEST_COMMAND_C__');
		await user.keyboard('{ArrowUp}');
		expect(queryInput.getAttribute('aria-activedescendant')).toBe('__TEST_COMMAND_B__');

		const fireCommandSpy = jest.fn();
		addCommandListener('__TEST_COMMAND_B__', fireCommandSpy);

		await user.keyboard('{Enter}');

		expect(fireCommandSpy).toHaveBeenCalled();
		expect(closeSpy).toHaveBeenCalled();
	});

	test('allows commands to be filtered', async () => {
		const user = userEvent.setup();
		const closeSpy = jest.fn();

		registerCommand('__TEST_COMMAND_A__', { name: 'abcd' });
		registerCommand('__TEST_COMMAND_B__', { name: 'cdef' });
		registerCommand('__TEST_COMMAND_C__', { name: 'efgh' });

		const {
			getAllByRole,
			getByRole,
			queryAllByRole,
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

		expect(queryInput.getAttribute('aria-activedescendant')).toBe('__TEST_COMMAND_C__');

		const fireCommand3Spy = jest.fn();
		addCommandListener('__TEST_COMMAND_C__', fireCommand3Spy);

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
		addCommandListener('__TEST_COMMAND_A__', fireCommand1Spy);

		// When there's only one result, it fires even without being active descendant
		await user.keyboard('{Enter}');

		expect(fireCommand1Spy).toHaveBeenCalled();
		expect(closeSpy).toHaveBeenCalledTimes(2);

		await user.keyboard('z');

		commandButtons = queryAllByRole('button');
		expect(commandButtons.length).toBe(0);
	});
});
